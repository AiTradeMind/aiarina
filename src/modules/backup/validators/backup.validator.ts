export class EnterpriseBackupValidator {
  public static validateCreateBackup(body: any): { valid: boolean; error?: string } {
    if (!body || typeof body !== 'object') {
      return { valid: true }; // allow defaults
    }
    if (body.backupType && !['FULL', 'INCREMENTAL', 'DIFFERENTIAL', 'SNAPSHOT'].includes(body.backupType)) {
      return { valid: false, error: 'Invalid backupType. Must be FULL, INCREMENTAL, DIFFERENTIAL, or SNAPSHOT.' };
    }
    return { valid: true };
  }

  public static validateRestore(body: any): { valid: boolean; error?: string } {
    if (!body || typeof body !== 'object') {
      return { valid: true }; // allow defaults
    }
    return { valid: true };
  }

  public static validateVerify(body: any): { valid: boolean; error?: string } {
    return { valid: true };
  }

  public static validateSimulate(body: any): { valid: boolean; error?: string } {
    return { valid: true };
  }
}
