export class OrganizationValidator {
  private static validTimezones = new Set(["UTC", "GMT", "EST", "PST", "EST5EDT", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Tokyo", "Asia/Kolkata"]);
  private static validLocales = new Set(["en-US", "en-GB", "es-ES", "fr-FR", "de-DE", "ja-JP", "zh-CN", "hi-IN"]);
  private static validCurrencies = new Set(["USD", "EUR", "GBP", "JPY", "CNY", "INR", "AUD", "CAD"]);

  public static validateOrganization(name: string, timezone: string, locale: string, currency: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error("Organization name must be at least 2 characters long.");
    }
    if (name.trim().length > 100) {
      throw new Error("Organization name cannot exceed 100 characters.");
    }
    if (!this.validTimezones.has(timezone)) {
      // Allow general offset fallback or default to UTC, but raise warning or throw on junk strings
      if (timezone.trim().length < 2) {
        throw new Error("Invalid timezone specification.");
      }
    }
    if (!this.validLocales.has(locale)) {
      if (locale.trim().length < 2) {
        throw new Error("Invalid locale specification.");
      }
    }
    if (!this.validCurrencies.has(currency)) {
      if (currency.trim().length < 3) {
        throw new Error("Invalid currency code specification.");
      }
    }
  }

  public static validateMemberRole(role: string): void {
    const validRoles = new Set(["OWNER", "ADMIN", "MEMBER"]);
    if (!validRoles.has(role)) {
      throw new Error(`Invalid member role: ${role}. Must be OWNER, ADMIN, or MEMBER.`);
    }
  }

  public static validateWorkspaceVisibility(visibility: string): void {
    const validVisibilities = new Set(["PRIVATE", "PUBLIC", "INTERNAL"]);
    if (!validVisibilities.has(visibility)) {
      throw new Error(`Invalid workspace visibility: ${visibility}. Must be PRIVATE, PUBLIC, or INTERNAL.`);
    }
  }
}
