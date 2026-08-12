/**
 * AI ARINA Enterprise V1.0 - Enterprise Validation Engine Foundation
 * Centralized validation registry, pipeline, severity levels, and execution standards.
 */

export enum ValidationSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export enum ValidationCategory {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  BUSINESS_RULE = 'BUSINESS_RULE',
  PERMISSION = 'PERMISSION',
  CONFIGURATION = 'CONFIGURATION',
  ENVIRONMENT = 'ENVIRONMENT',
  DATABASE = 'DATABASE',
  REPOSITORY = 'REPOSITORY',
  RUNTIME = 'RUNTIME',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  SECURITY = 'SECURITY',
  AI = 'AI',
  TRADING = 'TRADING',
  PORTFOLIO = 'PORTFOLIO',
  RISK = 'RISK',
  OMS = 'OMS',
  PMS = 'PMS',
  RMS = 'RMS',
  SCHEDULER = 'SCHEDULER',
  WORKER = 'WORKER',
  QUEUE = 'QUEUE',
}

export interface ValidationRuleResult {
  ruleId: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  passed: boolean;
  message: string;
  moduleName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ValidationPipelineReport {
  overallStatus: 'PASSED' | 'FAILED' | 'WARNING';
  totalRulesChecked: number;
  passedCount: number;
  failedCount: number;
  warningCount: number;
  healthScore: number;
  timestamp: string;
  results: ValidationRuleResult[];
}

export type ValidatorFunction = (context?: any) => Promise<ValidationRuleResult> | ValidationRuleResult;

export interface RegisteredValidator {
  id: string;
  moduleName: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
  validator: ValidatorFunction;
}

export class EnterpriseValidationRegistry {
  private validators: Map<string, RegisteredValidator> = new Map();

  public register(validator: RegisteredValidator): void {
    this.validators.set(validator.id, validator);
  }

  public unregister(id: string): void {
    this.validators.delete(id);
  }

  public getValidators(category?: ValidationCategory): RegisteredValidator[] {
    const list = Array.from(this.validators.values());
    if (category) {
      return list.filter(v => v.category === category);
    }
    return list;
  }

  public clear(): void {
    this.validators.clear();
  }
}

export const globalValidationRegistry = new EnterpriseValidationRegistry();

export class EnterpriseValidationEngine {
  private registry: EnterpriseValidationRegistry;

  constructor(registry: EnterpriseValidationRegistry = globalValidationRegistry) {
    this.registry = registry;
  }

  public async runPipeline(category?: ValidationCategory, context?: any): Promise<ValidationPipelineReport> {
    const validators = this.registry.getValidators(category);
    const results: ValidationRuleResult[] = [];

    for (const item of validators) {
      try {
        const res = await item.validator(context);
        results.push(res);
      } catch (err: any) {
        results.push({
          ruleId: item.id,
          category: item.category,
          severity: item.severity,
          passed: false,
          message: `Validator execution exception: ${err.message || err}`,
          moduleName: item.moduleName,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const totalRulesChecked = results.length;
    const passedCount = results.filter(r => r.passed).length;
    const failedCount = results.filter(r => !r.passed && (r.severity === ValidationSeverity.CRITICAL || r.severity === ValidationSeverity.HIGH)).length;
    const warningCount = results.filter(r => !r.passed && r.severity !== ValidationSeverity.CRITICAL && r.severity !== ValidationSeverity.HIGH).length;

    let overallStatus: 'PASSED' | 'FAILED' | 'WARNING' = 'PASSED';
    if (failedCount > 0) {
      overallStatus = 'FAILED';
    } else if (warningCount > 0) {
      overallStatus = 'WARNING';
    }

    const healthScore = totalRulesChecked > 0 ? Number(((passedCount / totalRulesChecked) * 100).toFixed(2)) : 100.0;

    return {
      overallStatus,
      totalRulesChecked,
      passedCount,
      failedCount,
      warningCount,
      healthScore,
      timestamp: new Date().toISOString(),
      results,
    };
  }
}

export const enterpriseValidationEngine = new EnterpriseValidationEngine();
