import { CreateSecretDTO, RotateSecretDTO, VerifySecretDTO, ImportSecretsDTO, SecretCategory } from '../types/secrets.types';

export class EnterpriseSecretsValidator {
  private static validCategories: SecretCategory[] = [
    'API_KEY',
    'OPENROUTER',
    'LLM_PROVIDER',
    'DATABASE_CREDENTIAL',
    'REDIS_CREDENTIAL',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'WEBHOOK_SECRET',
    'SMTP_CREDENTIAL',
    'OAUTH_CREDENTIAL'
  ];

  public static validateCreateSecret(body: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!body || typeof body !== 'object') {
      return { valid: false, errors: ['Request body must be a valid JSON object'] };
    }

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Field "name" is required and must be a non-empty string');
    }

    if (!body.category || !this.validCategories.includes(body.category)) {
      errors.push(`Field "category" is required and must be one of: ${this.validCategories.join(', ')}`);
    }

    if (!body.rawSecretValue || typeof body.rawSecretValue !== 'string' || body.rawSecretValue.trim().length === 0) {
      errors.push('Field "rawSecretValue" is required and must be a non-empty string');
    }

    if (body.environment && !['PRODUCTION', 'STAGING', 'DEVELOPMENT'].includes(body.environment)) {
      errors.push('Field "environment" must be one of PRODUCTION, STAGING, DEVELOPMENT');
    }

    if (body.autoRotateDays !== undefined && (typeof body.autoRotateDays !== 'number' || body.autoRotateDays < 1)) {
      errors.push('Field "autoRotateDays" must be a positive integer');
    }

    return { valid: errors.length === 0, errors };
  }

  public static validateRotateSecret(body: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!body || typeof body !== 'object') {
      return { valid: false, errors: ['Request body must be a valid JSON object'] };
    }

    if (!body.secretId || typeof body.secretId !== 'string') {
      errors.push('Field "secretId" is required and must be a string');
    }

    return { valid: errors.length === 0, errors };
  }

  public static validateVerifySecret(body: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!body || typeof body !== 'object') {
      return { valid: false, errors: ['Request body must be a valid JSON object'] };
    }

    if (!body.secretId && !body.rawSecretValue) {
      errors.push('Either "secretId" or "rawSecretValue" must be provided for verification');
    }

    return { valid: errors.length === 0, errors };
  }

  public static validateImportSecrets(body: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!body || typeof body !== 'object') {
      return { valid: false, errors: ['Request body must be a valid JSON object'] };
    }

    if (!Array.isArray(body.secrets) || body.secrets.length === 0) {
      errors.push('Field "secrets" must be a non-empty array of secret objects');
    } else {
      body.secrets.forEach((s: any, idx: number) => {
        if (!s.name || !s.category || !s.rawSecretValue) {
          errors.push(`Secret item at index ${idx} must contain name, category, and rawSecretValue`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }
}
