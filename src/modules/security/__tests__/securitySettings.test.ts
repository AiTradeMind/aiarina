import { describe, it, expect, beforeEach } from 'vitest';
import {
  SecuritySettingsService,
  redactSecrets
} from '../services/SecuritySettingsService';

describe('SecuritySettingsService — Section 5 Security Module', () => {
  beforeEach(() => {
    SecuritySettingsService.resetState();
  });

  describe('1. Default Canonical State', () => {
    it('initializes with default security settings', () => {
      const settings = SecuritySettingsService.getSettings();
      expect(settings.mfaState).toBe('NOT_CONFIGURED');
      expect(settings.twoFactorEnabled).toBe(false);
      expect(settings.securitySessionTimeout).toBe('60');
      expect(settings.securityIpWhitelist).toBe(false);
      expect(settings.ipWhitelistStatus).toBe('DISABLED');
      expect(settings.securityAuditLogLevel).toBe('VERBOSE');
    });

    it('reports overall security status as NOT_CONFIGURED by default', () => {
      const overall = SecuritySettingsService.getOverallSecurityStatus();
      expect(overall).toBe('NOT_CONFIGURED');
    });
  });

  describe('2. MFA / Two-Factor Authentication States', () => {
    it('transitions to CONFIGURED when TOTP secret is configured', () => {
      const result = SecuritySettingsService.configureTotpSecret('SECRET123');
      expect(result.mfaState).toBe('CONFIGURED');

      const settings = SecuritySettingsService.getSettings();
      expect(settings.mfaState).toBe('CONFIGURED');
      expect(settings.totpSecretConfigured).toBe(true);
      expect(settings.twoFactorEnabled).toBe(false);
    });

    it('transitions to ENABLED when 2FA is turned on after TOTP secret exists', () => {
      SecuritySettingsService.configureTotpSecret('SECRET123');
      SecuritySettingsService.updateSettings({ twoFactorEnabled: true });

      const settings = SecuritySettingsService.getSettings();
      expect(settings.mfaState).toBe('ENABLED');
      expect(settings.twoFactorEnabled).toBe(true);
    });

    it('transitions to CONFIGURED when 2FA is turned off after being enabled', () => {
      SecuritySettingsService.configureTotpSecret('SECRET123');
      SecuritySettingsService.updateSettings({ twoFactorEnabled: true });
      SecuritySettingsService.updateSettings({ twoFactorEnabled: false });

      const settings = SecuritySettingsService.getSettings();
      expect(settings.mfaState).toBe('CONFIGURED');
      expect(settings.twoFactorEnabled).toBe(false);
    });

    it('auto-configures TOTP secret if user enables 2FA directly', () => {
      SecuritySettingsService.updateSettings({ twoFactorEnabled: true });

      const settings = SecuritySettingsService.getSettings();
      expect(settings.mfaState).toBe('ENABLED');
      expect(settings.totpSecretConfigured).toBe(true);
    });
  });

  describe('3. IP Whitelist Enforcer State Accuracy', () => {
    it('reports NOT_CONFIGURED when IP Whitelist is enabled but no IP ranges are specified', () => {
      SecuritySettingsService.updateSettings({
        securityIpWhitelist: true,
        ipWhitelistRanges: []
      });

      const settings = SecuritySettingsService.getSettings();
      expect(settings.securityIpWhitelist).toBe(true);
      expect(settings.ipWhitelistStatus).toBe('NOT_CONFIGURED');
    });

    it('reports ACTIVE when IP Whitelist is enabled and valid IP ranges are configured', () => {
      SecuritySettingsService.updateSettings({
        securityIpWhitelist: true,
        ipWhitelistRanges: ['127.0.0.1', '192.168.1.0/24']
      });

      const settings = SecuritySettingsService.getSettings();
      expect(settings.securityIpWhitelist).toBe(true);
      expect(settings.ipWhitelistStatus).toBe('ACTIVE');
    });

    it('permits whitelisted IPs and blocks unlisted IPs when ACTIVE', () => {
      SecuritySettingsService.updateSettings({
        securityIpWhitelist: true,
        ipWhitelistRanges: ['127.0.0.1', '10.0.0.0/8']
      });

      expect(SecuritySettingsService.isIpAllowed('127.0.0.1')).toBe(true);
      expect(SecuritySettingsService.isIpAllowed('10.1.2.3')).toBe(true);
      expect(SecuritySettingsService.isIpAllowed('203.0.113.5')).toBe(false);
    });

    it('allows all IPs when IP Whitelist is DISABLED', () => {
      SecuritySettingsService.updateSettings({
        securityIpWhitelist: false,
        ipWhitelistRanges: ['127.0.0.1']
      });

      expect(SecuritySettingsService.isIpAllowed('203.0.113.5')).toBe(true);
    });
  });

  describe('4. Session Inactivity Timeout Enforcement', () => {
    it('creates active session and validates touch', () => {
      const session = SecuritySettingsService.createSession(1, true, '127.0.0.1');
      expect(session.sessionId).toBeDefined();

      const validation = SecuritySettingsService.validateAndTouchSession(session.sessionId);
      expect(validation.valid).toBe(true);
    });

    it('invalidates session on explicit logout', () => {
      const session = SecuritySettingsService.createSession(1, true, '127.0.0.1');
      SecuritySettingsService.invalidateSession(session.sessionId);

      const validation = SecuritySettingsService.validateAndTouchSession(session.sessionId);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('SESSION_INVALIDATED');
    });

    it('expires session after inactivity timeout', () => {
      SecuritySettingsService.updateSettings({ securitySessionTimeout: '15' }); // 15 mins
      const session = SecuritySettingsService.createSession(1, true, '127.0.0.1');

      // Simulate 16 minutes passing
      const sixteenMinutes = 16 * 60 * 1000;
      session.lastActivityAt = Date.now() - sixteenMinutes;

      const validation = SecuritySettingsService.validateAndTouchSession(session.sessionId);
      expect(validation.valid).toBe(false);
      expect(validation.reason).toBe('SESSION_EXPIRED');
    });
  });

  describe('5. Secret Redaction Guarantee', () => {
    it('redacts sensitive keys from audit log objects', () => {
      const payload = {
        username: 'trader1',
        password: 'SuperSecretPassword123!',
        apiBrokerKey: 'AKIAIOSFODNN7EXAMPLE',
        apiBrokerSecret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        telegramBotToken: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
        totpSecret: 'JBSWY3DPEHPK3PXP',
        nested: {
          sessionToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.K3...',
          normalField: 'Public Data'
        }
      };

      const sanitized = redactSecrets(payload);
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.apiBrokerKey).toBe('[REDACTED]');
      expect(sanitized.apiBrokerSecret).toBe('[REDACTED]');
      expect(sanitized.telegramBotToken).toBe('[REDACTED]');
      expect(sanitized.totpSecret).toBe('[REDACTED]');
      expect(sanitized.nested.sessionToken).toBe('[REDACTED]');
      expect(sanitized.nested.normalField).toBe('Public Data');
      expect(sanitized.username).toBe('trader1');
    });

    it('applies secret redaction before writing to audit logs', () => {
      SecuritySettingsService.updateSettings({ securityAuditLogLevel: 'VERBOSE' });

      SecuritySettingsService.logAuditEvent({
        eventType: 'USER_LOGIN',
        level: 'VERBOSE',
        details: {
          token: 'secret-token-value-99',
          userIp: '127.0.0.1'
        }
      });

      const logs = SecuritySettingsService.getAuditLogs();
      expect(logs.length).toBeGreaterThan(0);
      const latest = logs[0];
      expect(latest.details.token).toBe('[REDACTED]');
      expect(latest.details.userIp).toBe('127.0.0.1');
    });
  });

  describe('6. Overall Security Status Accuracy', () => {
    it('calculates CONFIGURED when MFA is ENABLED and IP Whitelist is ACTIVE', () => {
      SecuritySettingsService.updateSettings({
        twoFactorEnabled: true,
        securityIpWhitelist: true,
        ipWhitelistRanges: ['127.0.0.1']
      });

      expect(SecuritySettingsService.getOverallSecurityStatus()).toBe('CONFIGURED');
    });

    it('calculates PARTIALLY_CONFIGURED when only MFA is ENABLED', () => {
      SecuritySettingsService.updateSettings({
        twoFactorEnabled: true,
        securityIpWhitelist: false
      });

      expect(SecuritySettingsService.getOverallSecurityStatus()).toBe('PARTIALLY_CONFIGURED');
    });

    it('calculates NOT_CONFIGURED when no controls are enabled or configured', () => {
      SecuritySettingsService.updateSettings({
        mfaState: 'NOT_CONFIGURED',
        securityIpWhitelist: false
      });

      expect(SecuritySettingsService.getOverallSecurityStatus()).toBe('NOT_CONFIGURED');
    });
  });
});
