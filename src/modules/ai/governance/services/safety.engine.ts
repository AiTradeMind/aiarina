import { SafetyReport } from "../types/governance.types.ts";

export interface SafetyScanResult {
  promptRiskScore: number;
  outputRiskScore: number;
  riskFlags: string[];
  scannerLogs: string;
  passed: boolean;
}

export class PromptRiskAnalyzer {
  private injectionPatterns = [
    /ignore previous instructions/i,
    /system override/i,
    /override rules/i,
    /execute trade/i,
    /allocate capital/i,
    /modify portfolio/i,
    /buy stock/i,
    /sell stock/i,
    /transfer funds/i
  ];

  public analyze(prompt: string): { riskScore: number; flags: string[]; logs: string } {
    let riskScore = 0;
    const flags: string[] = [];
    const logs: string[] = [];

    const promptStr = typeof prompt === "string" ? prompt : JSON.stringify(prompt);

    // Check injection
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(promptStr)) {
        riskScore = Math.max(riskScore, 85);
        flags.push("PROMPT_INJECTION_ATTEMPT");
        logs.push(`Detected potential prompt injection/override pattern: ${pattern.toString()}`);
      }
    }

    // Check financial execution words
    if (/execute.*trade|trade.*execute|buy.*shares|sell.*shares|allocate.*capital/i.test(promptStr)) {
      riskScore = 100;
      flags.push("FORBIDDEN_EXECUTION_REQUEST");
      logs.push("Critical Alert: Prompt requested portfolio modification or execution of a trade, which is strictly forbidden.");
    }

    // Baseline scanning
    if (promptStr.length > 10000) {
      riskScore = Math.max(riskScore, 30);
      flags.push("EXCESSIVE_INPUT_LENGTH");
      logs.push("Prompt length exceeds standard safety thresholds.");
    }

    if (riskScore === 0) {
      logs.push("Prompt scanned. No risk factors detected.");
    }

    return { riskScore, flags, logs: logs.join(" | ") };
  }
}

export class OutputRiskAnalyzer {
  private executionTriggers = [
    /executing trade/i,
    /portfolio modified/i,
    /portfolio updated/i,
    /capital allocated/i,
    /initiating buy/i,
    /initiating sell/i,
    /order placed/i,
    /submitting order/i,
    /trade execution initiated/i
  ];

  public analyze(output: string): { riskScore: number; flags: string[]; logs: string } {
    let riskScore = 0;
    const flags: string[] = [];
    const logs: string[] = [];

    const outputStr = typeof output === "string" ? output : JSON.stringify(output);

    // Check for execution behaviors in outputs
    for (const pattern of this.executionTriggers) {
      if (pattern.test(outputStr)) {
        riskScore = 100;
        flags.push("UNAUTHORIZED_AUTONOMOUS_EXECUTION");
        logs.push(`Severe Rule Violation: Output suggests active financial execution or portfolio modification: ${pattern.toString()}`);
      }
    }

    // Check for sensitive leakage
    if (/api_key|password|secret_key|private_key/i.test(outputStr)) {
      riskScore = Math.max(riskScore, 90);
      flags.push("SENSITIVE_INFO_LEAKAGE");
      logs.push("Output contains potential system credentials or keys.");
    }

    // Check for high-risk hallucination keywords
    if (/guaranteed returns|zero risk|100% accurate/i.test(outputStr)) {
      riskScore = Math.max(riskScore, 60);
      flags.push("COMPLIANCE_RISK_HALLUCINATION");
      logs.push("Output makes non-compliant financial claims or promises.");
    }

    if (riskScore === 0) {
      logs.push("Output scanned. No risk factors detected.");
    }

    return { riskScore, flags, logs: logs.join(" | ") };
  }
}

export class SafetyPolicyManager {
  private maxAllowedPromptRisk = 75;
  private maxAllowedOutputRisk = 70;

  public isRiskAcceptable(promptScore: number, outputScore: number): boolean {
    return promptScore <= this.maxAllowedPromptRisk && outputScore <= this.maxAllowedOutputRisk;
  }
}

export class SafetyScanner {
  private promptAnalyzer = new PromptRiskAnalyzer();
  private outputAnalyzer = new OutputRiskAnalyzer();
  private policyManager = new SafetyPolicyManager();

  public scan(prompt: any, output: any): SafetyScanResult {
    const promptStr = typeof prompt === "string" ? prompt : JSON.stringify(prompt || "");
    const outputStr = typeof output === "string" ? output : JSON.stringify(output || "");

    const pResult = this.promptAnalyzer.analyze(promptStr);
    const oResult = this.outputAnalyzer.analyze(outputStr);

    const mergedFlags = Array.from(new Set([...pResult.flags, ...oResult.flags]));
    const logs = `Prompt Scans: [${pResult.logs}] || Output Scans: [${oResult.logs}]`;

    const isAcceptable = this.policyManager.isRiskAcceptable(pResult.riskScore, oResult.riskScore);

    return {
      promptRiskScore: pResult.riskScore,
      outputRiskScore: oResult.riskScore,
      riskFlags: mergedFlags,
      scannerLogs: logs,
      passed: isAcceptable && mergedFlags.length === 0
    };
  }
}

export class SafetyEngine {
  private scanner = new SafetyScanner();

  public async evaluateSafety(prompt: any, output: any): Promise<SafetyScanResult> {
    return this.scanner.scan(prompt, output);
  }
}
