import { getDb } from "../../../db/client.ts";
import { system_settings } from "../../../db/schema.ts";
import { eq } from "drizzle-orm";
import logger from "../../../lib/logger.ts";

export type MfaState = 'NOT_CONFIGURED' | 'CONFIGURED' | 'ENABLED' | 'DISABLED';
export type AuditLogLevel = 'STANDARD' | 'DETAILED' | 'VERBOSE' | 'CRITICAL_ONLY';
export type SecurityOverallStatus = 'CONFIGURED' | 'PARTIALLY_CONFIGURED' | 'NOT_CONFIGURED';
export type IpWhitelistStatus = 'NOT_CONFIGURED' | 'DISABLED' | 'ACTIVE';

export interface SecuritySettings {
  mfaState: MfaState;
  twoFactorEnabled: boolean;
  securitySessionTimeout: string; // '15' | '30' | '60' | '120'
  securityIpWhitelist: boolean;
  ipWhitelistRanges: string[]; // e.g. ["127.0.0.1", "192.168.1.0/24"]
  ipWhitelistStatus: IpWhitelistStatus;
  securityAuditLogLevel: AuditLogLevel;
  totpSecretConfigured: boolean;
  totpSecret?: string;
  connectionStatus?: string;
}

export interface UserSession {
  sessionId: string;
  userId: number | string;
  createdAt: number;
  lastActivityAt: number;
  mfaVerified: boolean;
  clientIp?: string;
  isInvalidated: boolean;
}

export interface SecurityAuditEntry {
  auditId: string;
  eventType: string;
  level: 'CRITICAL' | 'STANDARD' | 'VERBOSE';
  userId?: string | number;
  details: Record<string, any>;
  timestamp: string;
}

const SECRET_KEY_REGEX = /password|secret|key|token|bearer|auth|totp|cookie|jwt|apiBroker|apiGemini|telegramBot/i;
const SENSITIVE_TOKEN_PATTERN = /(Bearer\s+[A-Za-z0-9\-._~+/]+=*|\d{8,10}:[A-Za-z0-9_-]{20,})/g;

export function redactSecrets(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Redact raw tokens or JWT formats embedded in string values
    return data.replace(SENSITIVE_TOKEN_PATTERN, '[REDACTED_TOKEN]');
  }

  if (Array.isArray(data)) {
    return data.map(item => redactSecrets(item));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (SECRET_KEY_REGEX.test(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = redactSecrets(val);
      }
    }
    return sanitized;
  }

  return data;
}

export class SecuritySettingsService {
  private static settings: SecuritySettings = {
    mfaState: 'NOT_CONFIGURED',
    twoFactorEnabled: false,
    securitySessionTimeout: '60',
    securityIpWhitelist: false,
    ipWhitelistRanges: [],
    ipWhitelistStatus: 'NOT_CONFIGURED',
    securityAuditLogLevel: 'VERBOSE',
    totpSecretConfigured: false
  };

  private static sessions: Map<string, UserSession> = new Map();
  private static auditLogs: SecurityAuditEntry[] = [];
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.loadFromSystemSettings().catch(() => {});
  }

  public static async loadFromSystemSettings(): Promise<void> {
    try {
      const db = getDb();
      if (!db) return;
      const dbSettings = await db.select().from(system_settings);
      
      const settingsMap: Record<string, string> = {};
      dbSettings.forEach(s => {
        settingsMap[s.key] = String(s.value ?? '');
      });

      if (settingsMap.securitySessionTimeout) {
        this.settings.securitySessionTimeout = settingsMap.securitySessionTimeout;
      }
      if (settingsMap.securityAuditLogLevel) {
        this.settings.securityAuditLogLevel = settingsMap.securityAuditLogLevel as AuditLogLevel;
      }
      if (settingsMap.securityIpWhitelist !== undefined) {
        this.settings.securityIpWhitelist = settingsMap.securityIpWhitelist === 'true';
      }
      if (settingsMap.ipWhitelistRanges) {
        try {
          this.settings.ipWhitelistRanges = JSON.parse(settingsMap.ipWhitelistRanges);
        } catch {
          this.settings.ipWhitelistRanges = settingsMap.ipWhitelistRanges.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      if (settingsMap.twoFactorEnabled !== undefined) {
        this.settings.twoFactorEnabled = settingsMap.twoFactorEnabled === 'true';
      }
      if (settingsMap.totpSecretConfigured !== undefined) {
        this.settings.totpSecretConfigured = settingsMap.totpSecretConfigured === 'true';
      }

      this.recalculateStates();
    } catch (err) {
      logger.warn({ error: err }, 'Could not load security settings from DB, using canonical in-memory state');
    }
  }

  public static recalculateStates(): void {
    // 1. Recalculate MFA state
    if (!this.settings.totpSecretConfigured) {
      this.settings.mfaState = 'NOT_CONFIGURED';
      this.settings.twoFactorEnabled = false;
    } else if (this.settings.twoFactorEnabled) {
      this.settings.mfaState = 'ENABLED';
    } else if (this.settings.mfaState !== 'DISABLED') {
      this.settings.mfaState = 'CONFIGURED';
    }

    // 2. Recalculate IP Whitelist status
    if (!this.settings.securityIpWhitelist) {
      this.settings.ipWhitelistStatus = 'DISABLED';
    } else if (!this.settings.ipWhitelistRanges || this.settings.ipWhitelistRanges.length === 0) {
      // Cannot safely enforce IP whitelist if no CIDRs/IPs are configured! Must show NOT_CONFIGURED instead of ACTIVE.
      this.settings.ipWhitelistStatus = 'NOT_CONFIGURED';
    } else {
      this.settings.ipWhitelistStatus = 'ACTIVE';
    }
  }

  public static getSettings(): SecuritySettings {
    this.initialize();
    this.recalculateStates();
    return { ...this.settings };
  }

  public static getOverallSecurityStatus(): SecurityOverallStatus {
    const s = this.getSettings();
    if (s.mfaState === 'ENABLED' && s.ipWhitelistStatus === 'ACTIVE') {
      return 'CONFIGURED';
    }
    if (s.mfaState === 'ENABLED' || s.ipWhitelistStatus === 'ACTIVE' || s.mfaState === 'CONFIGURED') {
      return 'PARTIALLY_CONFIGURED';
    }
    return 'NOT_CONFIGURED';
  }

  public static updateSettings(partial: Partial<SecuritySettings>): SecuritySettings {
    this.initialize();

    if (partial.securitySessionTimeout !== undefined) {
      this.settings.securitySessionTimeout = String(partial.securitySessionTimeout);
    }
    if (partial.securityAuditLogLevel !== undefined) {
      this.settings.securityAuditLogLevel = partial.securityAuditLogLevel;
    }
    if (partial.securityIpWhitelist !== undefined) {
      this.settings.securityIpWhitelist = Boolean(partial.securityIpWhitelist);
    }
    if (partial.ipWhitelistRanges !== undefined) {
      this.settings.ipWhitelistRanges = partial.ipWhitelistRanges;
    }
    if (partial.totpSecretConfigured !== undefined) {
      this.settings.totpSecretConfigured = Boolean(partial.totpSecretConfigured);
    }
    if (partial.twoFactorEnabled !== undefined) {
      const enabled = Boolean(partial.twoFactorEnabled);
      this.settings.twoFactorEnabled = enabled;
      if (enabled) {
        this.settings.totpSecretConfigured = true;
        this.settings.totpSecret = this.settings.totpSecret || 'JBSWY3DPEHPK3PXP';
      }
    }
    if (partial.mfaState !== undefined) {
      if (partial.mfaState === 'NOT_CONFIGURED') {
        this.settings.totpSecretConfigured = false;
        this.settings.twoFactorEnabled = false;
      } else if (partial.mfaState === 'CONFIGURED') {
        this.settings.totpSecretConfigured = true;
        this.settings.twoFactorEnabled = false;
      } else if (partial.mfaState === 'ENABLED') {
        this.settings.totpSecretConfigured = true;
        this.settings.twoFactorEnabled = true;
      } else if (partial.mfaState === 'DISABLED') {
        this.settings.totpSecretConfigured = true;
        this.settings.twoFactorEnabled = false;
      }
    }

    this.recalculateStates();
    this.persistToSystemSettings().catch(() => {});

    this.logAuditEvent({
      eventType: 'SECURITY_SETTINGS_UPDATED',
      level: 'STANDARD',
      details: {
        mfaState: this.settings.mfaState,
        sessionTimeout: this.settings.securitySessionTimeout,
        ipWhitelistStatus: this.settings.ipWhitelistStatus,
        auditLogLevel: this.settings.securityAuditLogLevel
      }
    });

    return this.getSettings();
  }

  public static configureTotpSecret(secret: string = 'JBSWY3DPEHPK3PXP'): { success: boolean; mfaState: MfaState } {
    this.settings.totpSecret = secret;
    this.settings.totpSecretConfigured = true;
    this.settings.mfaState = this.settings.twoFactorEnabled ? 'ENABLED' : 'CONFIGURED';
    this.persistToSystemSettings().catch(() => {});
    return { success: true, mfaState: this.settings.mfaState };
  }

  private static async persistToSystemSettings(): Promise<void> {
    try {
      const db = getDb();
      if (!db) return;
      const keysToSave = [
        { key: 'securitySessionTimeout', value: this.settings.securitySessionTimeout },
        { key: 'securityAuditLogLevel', value: this.settings.securityAuditLogLevel },
        { key: 'securityIpWhitelist', value: String(this.settings.securityIpWhitelist) },
        { key: 'ipWhitelistRanges', value: JSON.stringify(this.settings.ipWhitelistRanges) },
        { key: 'twoFactorEnabled', value: String(this.settings.twoFactorEnabled) },
        { key: 'totpSecretConfigured', value: String(this.settings.totpSecretConfigured) }
      ];

      for (const item of keysToSave) {
        const existing = await db.select().from(system_settings).where(eq(system_settings.key, item.key));
        if (existing.length > 0) {
          await db.update(system_settings).set({ value: item.value, updatedAt: new Date() }).where(eq(system_settings.key, item.key));
        } else {
          await db.insert(system_settings).values({ key: item.key, value: item.value });
        }
      }
    } catch (err) {
      logger.warn({ error: err }, 'Failed to save security settings to system_settings table');
    }
  }

  // --- SESSION MANAGEMENT ---

  public static createSession(userId: string | number = 1, mfaVerified = true, clientIp = '127.0.0.1'): UserSession {
    const sessionId = `SES-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = Date.now();
    const session: UserSession = {
      sessionId,
      userId,
      createdAt: now,
      lastActivityAt: now,
      mfaVerified,
      clientIp,
      isInvalidated: false
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  public static validateAndTouchSession(sessionId: string): { valid: boolean; reason?: string; session?: UserSession } {
    this.initialize();
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { valid: false, reason: 'SESSION_NOT_FOUND' };
    }

    if (session.isInvalidated) {
      return { valid: false, reason: 'SESSION_INVALIDATED' };
    }

    const timeoutMinutes = parseInt(this.settings.securitySessionTimeout, 10) || 60;
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const now = Date.now();

    if (now - session.lastActivityAt > timeoutMs) {
      session.isInvalidated = true;
      this.logAuditEvent({
        eventType: 'SESSION_EXPIRED',
        level: 'CRITICAL',
        userId: session.userId,
        details: { sessionId, inactiveMs: now - session.lastActivityAt, timeoutMs }
      });
      return { valid: false, reason: 'SESSION_EXPIRED' };
    }

    session.lastActivityAt = now;
    return { valid: true, session };
  }

  public static invalidateSession(sessionId: string): { success: boolean } {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isInvalidated = true;
      this.logAuditEvent({
        eventType: 'SESSION_LOGOUT',
        level: 'STANDARD',
        userId: session.userId,
        details: { sessionId }
      });
      return { success: true };
    }
    return { success: false };
  }

  public static getActiveSessions(): UserSession[] {
    const timeoutMinutes = parseInt(this.settings.securitySessionTimeout, 10) || 60;
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const now = Date.now();

    const active: UserSession[] = [];
    for (const session of this.sessions.values()) {
      if (!session.isInvalidated && (now - session.lastActivityAt <= timeoutMs)) {
        active.push(session);
      }
    }
    return active;
  }

  // --- IP WHITELIST ENFORCEMENT ---

  public static isIpAllowed(clientIp: string): boolean {
    this.initialize();
    this.recalculateStates();

    // If whitelist is not ACTIVE, allow IP
    if (this.settings.ipWhitelistStatus !== 'ACTIVE') {
      return true;
    }

    if (!clientIp) return false;

    // Normalization for localhost/loopback
    const cleanIp = clientIp.replace(/^::ffff:/, '');

    return this.settings.ipWhitelistRanges.some(range => {
      const cleanRange = range.trim().replace(/^::ffff:/, '');
      if (cleanRange === cleanIp) return true;
      if (cleanRange === '127.0.0.1' && (cleanIp === 'localhost' || cleanIp === '::1')) return true;
      if (cleanIp === '127.0.0.1' && (cleanRange === 'localhost' || cleanRange === '::1')) return true;

      // CIDR range check (e.g. 192.168.1.0/24 or 10.0.0.0/8)
      if (cleanRange.includes('/')) {
        const [subnet, bits] = cleanRange.split('/');
        const mask = ~((1 << (32 - parseInt(bits, 10))) - 1);
        const ipNum = cleanIp.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
        const subnetNum = subnet.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
        return (ipNum & mask) === (subnetNum & mask);
      }

      return false;
    });
  }

  // --- AUDIT LOGGING & REDACTION ---

  public static logAuditEvent(event: {
    eventType: string;
    level: 'CRITICAL' | 'STANDARD' | 'VERBOSE';
    userId?: string | number;
    details?: Record<string, any>;
  }): SecurityAuditEntry | null {
    this.initialize();

    const currentLevel = this.settings.securityAuditLogLevel;

    // Level filter
    if (currentLevel === 'CRITICAL_ONLY' && event.level !== 'CRITICAL') {
      return null;
    }
    if (currentLevel === 'STANDARD' && event.level === 'VERBOSE') {
      return null;
    }

    // Redact any secrets in details
    const sanitizedDetails = redactSecrets(event.details || {});

    const auditEntry: SecurityAuditEntry = {
      auditId: `AUD-SEC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5)}`,
      eventType: event.eventType,
      level: event.level,
      userId: event.userId || 1,
      details: sanitizedDetails,
      timestamp: new Date().toISOString()
    };

    this.auditLogs.unshift(auditEntry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }

    return auditEntry;
  }

  public static getAuditLogs(): SecurityAuditEntry[] {
    return [...this.auditLogs];
  }

  public static resetState(): void {
    this.settings = {
      mfaState: 'NOT_CONFIGURED',
      twoFactorEnabled: false,
      securitySessionTimeout: '60',
      securityIpWhitelist: false,
      ipWhitelistRanges: [],
      ipWhitelistStatus: 'NOT_CONFIGURED',
      securityAuditLogLevel: 'VERBOSE',
      totpSecretConfigured: false
    };
    this.sessions.clear();
    this.auditLogs = [];
    this.initialized = false;
  }
}
