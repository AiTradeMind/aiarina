import { describe, it, expect, beforeEach } from "vitest";
import { NotificationSettingsService, maskToken, isMaskedToken } from "../services/NotificationSettingsService";
import { TelegramProvider } from "../services/TelegramProvider";

describe("Settings Module Section 4 — Notifications Audit & Integrity Tests", () => {
  beforeEach(() => {
    // Reset state before each test
    NotificationSettingsService.disconnectTelegram();
  });

  it("Requirement A & B: Should maintain canonical settings state and NEVER leak raw token in public getter", () => {
    NotificationSettingsService.updateSettings({
      telegramGatewayEnabled: true,
      telegramBotToken: "7891234560:AAFx98231_EnterpriseArinaToken",
      telegramTargetChatId: "-100987654321",
      tradeAlertsEnabled: true,
      dailyTradingSummaryEnabled: true
    });

    const publicSettings = NotificationSettingsService.getSettings();
    expect(publicSettings.telegramBotToken).toBe("");
    expect(publicSettings.botToken).toBe("");
    expect(publicSettings.maskedBotToken).toContain("••••");
    expect(publicSettings.telegramTargetChatId).toBe("-100987654321");

    const internalSettings = NotificationSettingsService.getInternalSettings();
    expect(internalSettings.rawBotToken).toBe("7891234560:AAFx98231_EnterpriseArinaToken");
  });

  it("Requirement B: Should NOT overwrite stored raw token when masked string is posted back", () => {
    const originalToken = "7891234560:AAFx98231_EnterpriseArinaToken";
    NotificationSettingsService.updateSettings({ telegramBotToken: originalToken });

    // Simulate UI posting back masked token e.g. "••••••••" or "789123...Token"
    NotificationSettingsService.updateSettings({
      telegramBotToken: "••••••••",
      telegramTargetChatId: "-100987654321"
    });

    const internalSettings = NotificationSettingsService.getInternalSettings();
    expect(internalSettings.rawBotToken).toBe(originalToken);
  });

  it("Requirement C & E: Should block Telegram test alerts when gateway is disabled or token is missing", async () => {
    NotificationSettingsService.updateSettings({
      telegramGatewayEnabled: false,
      telegramBotToken: "7891234560:AAFx98231_EnterpriseArinaToken",
      telegramTargetChatId: "-100987654321"
    });

    const dispatchResult = await TelegramProvider.sendMessage("Test Alert");
    expect(dispatchResult.ok).toBe(false);
    expect(dispatchResult.httpStatus).toBe(400);
    expect(dispatchResult.description).toContain("Disabled");
  });

  it("Requirement D: Should handle verification with invalid token gracefully without false status", async () => {
    NotificationSettingsService.updateSettings({
      telegramGatewayEnabled: true,
      telegramBotToken: "invalid_bot_token_12345",
      telegramTargetChatId: "-100987654321"
    });

    const verification = await TelegramProvider.verifyConnection();
    expect(verification.ok).toBe(false);
    expect(verification.status).toBe("INVALID_TOKEN");

    const currentSettings = NotificationSettingsService.getSettings();
    expect(currentSettings.connectionStatus).toBe("INVALID_TOKEN");
  });

  it("Requirement H: Should deterministically evaluate Mute Hours in Asia/Kolkata timezone", () => {
    // Enable mute hours starting 00:00 to 23:59 (covering all day for test)
    NotificationSettingsService.updateSettings({
      telegramMuteHoursEnabled: true,
      telegramMuteStart: "00:00",
      telegramMuteEnd: "23:59"
    });

    expect(NotificationSettingsService.isMuteHoursActive()).toBe(true);

    // Disable mute hours
    NotificationSettingsService.updateSettings({
      telegramMuteHoursEnabled: false
    });

    expect(NotificationSettingsService.isMuteHoursActive()).toBe(false);
  });

  it("Requirement L: Disconnect should clear credentials and set status to NOT_CONFIGURED", () => {
    NotificationSettingsService.updateSettings({
      telegramGatewayEnabled: true,
      telegramBotToken: "7891234560:AAFx98231_EnterpriseArinaToken",
      telegramTargetChatId: "-100987654321",
      connectionStatus: "CONNECTED"
    });

    const disconnected = NotificationSettingsService.disconnectTelegram();
    expect(disconnected.telegramTargetChatId).toBe("");
    expect(disconnected.maskedBotToken).toBe("");
    expect(disconnected.connectionStatus).toBe("NOT_CONFIGURED");
  });
});
