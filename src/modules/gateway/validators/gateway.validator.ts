export interface VerifyRequestPayload {
  path: string;
  method: string;
  headers?: Record<string, string>;
  payload?: any;
  consumerId?: string;
  version?: string;
}

export class EnterpriseGatewayValidator {
  public static validateVerifyRequest(input: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input || typeof input !== 'object') {
      return { valid: false, errors: ['Request body must be a valid JSON object'] };
    }

    if (!input.path || typeof input.path !== 'string') {
      errors.push('path is required and must be a string (e.g., "/api/v1/operations/summary")');
    }

    if (!input.method || typeof input.method !== 'string') {
      errors.push('method is required and must be a valid HTTP method string (e.g., "GET", "POST")');
    } else {
      const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
      if (!allowedMethods.includes(input.method.toUpperCase())) {
        errors.push(`Invalid HTTP method: ${input.method}. Allowed: ${allowedMethods.join(', ')}`);
      }
    }

    if (input.version && !['v1', 'v2'].includes(input.version)) {
      errors.push(`Invalid API version: ${input.version}. Allowed: v1, v2`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public static validateRoutePath(path: string): boolean {
    return typeof path === 'string' && path.startsWith('/api/');
  }
}
