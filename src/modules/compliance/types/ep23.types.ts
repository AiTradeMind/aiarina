export type RuleSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type PolicyCategory =
  | 'TRADING'
  | 'RISK'
  | 'AI_GOVERNANCE'
  | 'TREASURY'
  | 'ACCOUNTING'
  | 'SECURITY'
  | 'OPERATIONAL';

export interface ComplianceRuleItem {
  ruleId: string;
  name: string;
  category: PolicyCategory;
  severity: RuleSeverity;
  owner: string;
  version: string;
  effectiveDate: string;
  status: 'ACTIVE' | 'DRAFT' | 'DEPRECATED' | 'SUSPENDED';
  description: string;
}

export interface CompliancePolicyItem {
  policyId: string;
  name: string;
  category: PolicyCategory;
  scope: string;
  enforcementMode: 'STRICT_BLOCK' | 'AUDIT_LOG' | 'WARN_AND_ALLOW';
  rulesCount: number;
  isEnabled: boolean;
  createdAt: string;
}

export interface ComplianceValidationResult {
  validationId: string;
  targetModule: 'OMS' | 'PMS' | 'RMS' | 'EXECUTION' | 'ACCOUNTING' | 'TREASURY' | 'NOTIFICATIONS' | 'ADMINISTRATION' | 'OPERATIONS' | 'AI_GOVERNANCE';
  ruleId: string;
  status: 'PASSED' | 'FAILED' | 'EXEMPTED';
  validatedAt: string;
  details: string;
}

export interface ComplianceViolationItem {
  violationId: string;
  ruleId: string;
  ruleName: string;
  targetModule: string;
  severity: RuleSeverity;
  detectedAt: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'EXCEPTED';
  impactDescription: string;
}

export interface ComplianceExceptionItem {
  exceptionId: string;
  ruleId: string;
  requestedBy: string;
  approvedBy: string;
  businessJustification: string;
  expiryDate: string;
  status: 'APPROVED' | 'PENDING' | 'EXPIRED' | 'REJECTED';
  createdAt: string;
}

export interface ComplianceEvidenceItem {
  evidenceId: string;
  title: string;
  category: string;
  checksumSha256: string;
  fileFormat: string;
  storedUrl: string;
  createdAt: string;
}

export interface ComplianceReportItem {
  reportId: string;
  title: string;
  type: 'INDIAN_MARKET_SEBI' | 'INTERNAL_AUDIT' | 'POLICY_ENFORCEMENT' | 'EXCEPTION_SUMMARY';
  period: string;
  generatedAt: string;
  status: 'FINAL' | 'DRAFT';
  downloadUrl: string;
}

export interface ComplianceCertificateItem {
  certificateId: string;
  certificateType: 'SHA256_COMPLIANCE_CERTIFICATE' | 'POLICY_VERIFICATION_CERTIFICATE' | 'VALIDATION_CERTIFICATE';
  issuedTo: string;
  issuedAt: string;
  sha256Hash: string;
  status: 'VALID' | 'REVOKED';
}

export interface ComplianceAuditItem {
  auditId: string;
  actionType: 'RULE_CHANGE' | 'POLICY_CHANGE' | 'VIOLATION_DETECTED' | 'EXCEPTION_GRANTED' | 'CERTIFICATE_ISSUED';
  operator: string;
  details: string;
  timestamp: string;
}

export interface ComplianceDashboardOverview {
  totalRules: number;
  activePolicies: number;
  openViolations: number;
  activeExceptions: number;
  validCertificates: number;
  lastValidationTimestamp: string;
  complianceHealthScore: number;
}

export interface ComplianceQaReport {
  totalModulesTested: number;
  passCount: number;
  failCount: number;
  modules: Array<{
    moduleId: string;
    moduleName: string;
    status: 'PASSED' | 'FAILED';
    details: string;
  }>;
  readOnlyIntegrationConfirmed: boolean;
  paperTradingAndIndianMarketConfirmed: boolean;
  buildStatus: string;
}
