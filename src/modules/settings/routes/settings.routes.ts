import { Router } from "express";
import { getDb } from "../../../db/client.ts";
import { system_settings, workspace_preferences, preference_versions } from "../../../db/schema.ts";
import { eq, and } from "drizzle-orm";
import { SecuritySettingsService } from "../../security/services/SecuritySettingsService.ts";
import { ApiKeySettingsService } from "../../security/services/ApiKeySettingsService.ts";

export const settingsRouter = Router();

// GET /api/settings/apikeys
settingsRouter.get("/apikeys", (req, res) => {
  try {
    const states = ApiKeySettingsService.getStates();
    res.json({ success: true, data: states });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch API key states" });
  }
});

// POST /api/settings/apikeys
settingsRouter.post("/apikeys", (req, res) => {
  try {
    const { type, value } = req.body;
    const userId = (req as any).user?.userId || 1;
    if (!['gemini', 'brokerKey', 'brokerSecret', 'webhook'].includes(type)) {
      return res.status(400).json({ success: false, error: "Invalid credential type" });
    }
    const result = ApiKeySettingsService.saveCredential(type, value, userId);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }
    res.json({ success: true, message: "Credential saved securely", data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to save credential" });
  }
});

// POST /api/settings/apikeys/verify
settingsRouter.post("/apikeys/verify", (req, res) => {
  try {
    const { type } = req.body;
    const userId = (req as any).user?.userId || 1;
    const result = ApiKeySettingsService.verifyCredential(type, userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to verify credential" });
  }
});

// POST /api/settings/apikeys/rotate
settingsRouter.post("/apikeys/rotate", (req, res) => {
  try {
    const { type } = req.body;
    const userId = (req as any).user?.userId || 1;
    const result = ApiKeySettingsService.rotateCredential(type, userId);
    res.json({ success: true, message: "Credential rotated successfully", data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to rotate credential" });
  }
});

// POST /api/settings/apikeys/delete
settingsRouter.post("/apikeys/delete", (req, res) => {
  try {
    const { type } = req.body;
    const userId = (req as any).user?.userId || 1;
    const result = ApiKeySettingsService.deleteCredential(type, userId);
    res.json({ success: true, message: "Credential deleted successfully", data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to delete credential" });
  }
});

// GET /api/settings/security
settingsRouter.get("/security", (req, res) => {
  try {
    const settings = SecuritySettingsService.getSettings();
    const overallStatus = SecuritySettingsService.getOverallSecurityStatus();
    res.json({
      success: true,
      data: {
        ...settings,
        overallSecurityStatus: overallStatus
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch security settings" });
  }
});

// POST /api/settings/security
settingsRouter.post("/security", (req, res) => {
  try {
    const updated = SecuritySettingsService.updateSettings(req.body);
    const overallStatus = SecuritySettingsService.getOverallSecurityStatus();
    res.json({
      success: true,
      message: "Security settings updated successfully",
      data: {
        ...updated,
        overallSecurityStatus: overallStatus
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to update security settings" });
  }
});

// POST /api/settings/security/session/logout
settingsRouter.post("/security/session/logout", (req, res) => {
  try {
    const sessionId = req.body.sessionId || req.headers["x-session-id"];
    if (sessionId && typeof sessionId === "string") {
      SecuritySettingsService.invalidateSession(sessionId);
    }
    res.json({ success: true, message: "Session invalidated / logged out" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Logout failed" });
  }
});

// POST /api/settings/security/mfa/configure
settingsRouter.post("/security/mfa/configure", (req, res) => {
  try {
    const secret = req.body.totpSecret || "JBSWY3DPEHPK3PXP";
    const result = SecuritySettingsService.configureTotpSecret(secret);
    res.json({
      success: true,
      message: "TOTP 2FA configured successfully",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to configure 2FA" });
  }
});

// GET /api/settings/system
settingsRouter.get("/system", async (req, res) => {
  try {
    const db = getDb();
    const settings = await db.select().from(system_settings);
    
    // Default system settings
    let result: any = {
      theme: 'DARK_BLOOMBERG',
      language: 'EN-IN',
      currency: 'INR',
      marketRegion: 'INDIAN_MARKET_V1',
      timezone: 'Asia/Kolkata',
      aiModel: 'GEMINI_2.5_PRO',
      brokerPrimaryConnection: 'NO_CURRENT_LIVE_BROKER',
      environment: 'PRODUCTION'
    };

    settings.forEach(s => {
      result[s.key] = s.value;
    });

    res.json({ success: true, settings: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch system settings" });
  }
});

// POST /api/settings/system
settingsRouter.post("/system", async (req, res) => {
  try {
    const { settings } = req.body;
    const db = getDb();
    const userId = (req as any).user?.userId || 1;

    for (const [key, value] of Object.entries(settings)) {
      const existing = await db.select().from(system_settings).where(eq(system_settings.key, key));
      if (existing.length > 0) {
        await db.update(system_settings).set({ value: value as any, updatedBy: String(userId), updatedAt: new Date() }).where(eq(system_settings.key, key));
      } else {
        await db.insert(system_settings).values({ key, value: value as any, updatedBy: String(userId) });
      }
    }

    if (settings) {
      SecuritySettingsService.updateSettings({
        twoFactorEnabled: settings.twoFactorEnabled,
        securitySessionTimeout: settings.securitySessionTimeout,
        securityIpWhitelist: settings.securityIpWhitelist,
        securityAuditLogLevel: settings.securityAuditLogLevel,
        ipWhitelistRanges: settings.ipWhitelistRanges,
        mfaState: settings.mfaState
      });
    }

    res.json({ success: true, message: "System settings saved" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to save system settings" });
  }
});

// GET /api/settings/workspace
settingsRouter.get("/workspace", async (req, res) => {
  try {
    const { workspaceId } = req.query;
    const userId = (req as any).user?.userId || 1;
    
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: "Workspace ID required" });
    }

    const db = getDb();
    const prefs = await db.select().from(workspace_preferences)
      .where(and(
        eq(workspace_preferences.userId, userId),
        eq(workspace_preferences.workspaceId, workspaceId as string)
      ));

    if (prefs.length > 0) {
      res.json({ success: true, preferences: prefs[0].preferences });
    } else {
      res.json({ success: true, preferences: {} });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch workspace preferences" });
  }
});

// POST /api/settings/workspace
settingsRouter.post("/workspace", async (req, res) => {
  try {
    const { workspaceId, preferences } = req.body;
    const userId = (req as any).user?.userId || 1;

    if (!workspaceId || !preferences) {
      return res.status(400).json({ success: false, error: "workspaceId and preferences required" });
    }

    const db = getDb();
    const existing = await db.select().from(workspace_preferences)
      .where(and(
        eq(workspace_preferences.userId, userId),
        eq(workspace_preferences.workspaceId, workspaceId)
      ));

    let version = 1;

    if (existing.length > 0) {
      await db.update(workspace_preferences)
        .set({ preferences, updatedAt: new Date() })
        .where(and(
          eq(workspace_preferences.userId, userId),
          eq(workspace_preferences.workspaceId, workspaceId)
        ));
      
      const versions = await db.select().from(preference_versions)
        .where(and(
          eq(preference_versions.userId, userId),
          eq(preference_versions.workspaceId, workspaceId)
        ));
      version = versions.length + 1;
    } else {
      await db.insert(workspace_preferences).values({
        userId,
        workspaceId,
        preferences
      });
    }

    // Save version history
    await db.insert(preference_versions).values({
      userId,
      workspaceId,
      preferences,
      version,
      updatedBy: String(userId)
    });

    res.json({ success: true, message: "Workspace preferences saved" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to save workspace preferences" });
  }
});

// POST /api/settings/export
settingsRouter.post("/export", async (req, res) => {
  try {
    const db = getDb();
    const userId = (req as any).user?.userId || 1;

    const systemSettings = await db.select().from(system_settings);
    const workspacePrefs = await db.select().from(workspace_preferences).where(eq(workspace_preferences.userId, userId));

    const exportData = {
      systemSettings: systemSettings.reduce((acc: any, s) => ({ ...acc, [s.key]: s.value }), {}),
      workspacePreferences: workspacePrefs.reduce((acc: any, p) => ({ ...acc, [p.workspaceId]: p.preferences }), {})
    };

    res.json({ success: true, data: exportData });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to export settings" });
  }
});

// POST /api/settings/import
settingsRouter.post("/import", async (req, res) => {
  try {
    const { systemSettings, workspacePreferences } = req.body;
    const db = getDb();
    const userId = (req as any).user?.userId || 1;

    // Process system settings if any
    if (systemSettings && typeof systemSettings === 'object') {
       for (const [key, value] of Object.entries(systemSettings)) {
          const existing = await db.select().from(system_settings).where(eq(system_settings.key, key));
          if (existing.length > 0) {
            await db.update(system_settings).set({ value: value as any, updatedBy: String(userId), updatedAt: new Date() }).where(eq(system_settings.key, key));
          } else {
            await db.insert(system_settings).values({ key, value: value as any, updatedBy: String(userId) });
          }
       }
    }

    // Process workspace preferences if any
    if (workspacePreferences && typeof workspacePreferences === 'object') {
       for (const [workspaceId, preferences] of Object.entries(workspacePreferences)) {
          const existing = await db.select().from(workspace_preferences)
            .where(and(
              eq(workspace_preferences.userId, userId),
              eq(workspace_preferences.workspaceId, workspaceId)
            ));

          if (existing.length > 0) {
            await db.update(workspace_preferences)
              .set({ preferences: preferences as any, updatedAt: new Date() })
              .where(and(
                eq(workspace_preferences.userId, userId),
                eq(workspace_preferences.workspaceId, workspaceId)
              ));
          } else {
            await db.insert(workspace_preferences).values({
              userId,
              workspaceId,
              preferences: preferences as any
            });
          }
       }
    }

    res.json({ success: true, message: "Settings imported successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to import settings" });
  }
});

// POST /api/settings/reset
settingsRouter.post("/reset", async (req, res) => {
  try {
    const { scope, workspaceId } = req.body; // scope: 'SYSTEM' | 'WORKSPACE'
    const db = getDb();
    const userId = (req as any).user?.userId || 1;

    if (scope === 'SYSTEM') {
       await db.delete(system_settings);
    } else if (scope === 'WORKSPACE' && workspaceId) {
       await db.delete(workspace_preferences)
          .where(and(
            eq(workspace_preferences.userId, userId),
            eq(workspace_preferences.workspaceId, workspaceId)
          ));
    }

    res.json({ success: true, message: "Settings reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to reset settings" });
  }
});
