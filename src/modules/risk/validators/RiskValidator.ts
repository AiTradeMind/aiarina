export class RiskValidator {
  public validatePolicy(policy: any) {
    if (!policy.organizationId || !policy.entityType || !policy.entityId || !policy.riskType || !policy.limitValue) {
       throw new Error("Missing required fields for risk policy");
    }
  }
}

export const riskValidator = new RiskValidator();
