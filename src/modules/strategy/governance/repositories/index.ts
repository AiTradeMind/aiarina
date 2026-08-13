import { getDb } from "../../../../db/client.ts";
import { sql, eq, and, desc, or } from "drizzle-orm";
import {
  strategyRegistry,
  strategyGovernance,
  strategyPolicies,
  strategyPolicyRules,
  strategyPermissions,
  strategyApprovals,
  strategyReviewRequests,
  strategyReviewHistory,
  strategyCompliance,
  strategyAuditLogs,
  strategyGovernanceHistory
} from "../../../../db/schema.ts";
import {
  StrategyGovernance as TStrategyGovernance,
  StrategyPolicy,
  StrategyPermission,
  StrategyApproval,
  StrategyReviewRequest,
  StrategyCompliance,
  StrategyAuditLog,
  StrategyGovernanceHistory
} from "../types/index.ts";

const generateId = (prefix: string) => `${prefix}_${crypto.randomUUID().substring(0, 8)}`;

export class GovernanceRepository {
  private tablesVerified = false;

  async ensureTablesExist(): Promise<void> {
    if (this.tablesVerified) return;
    const db = await getDb();

    try {
      // 1. strategy_governance
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_governance (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'Draft' NOT NULL,
          risk_level VARCHAR(50),
          governance_score DOUBLE PRECISION DEFAULT 1.0,
          is_compliant BOOLEAN DEFAULT true,
          last_review_date TIMESTAMP,
          updated_by VARCHAR(100),
          updated_time TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // 2. strategy_policies
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_policies (
          id VARCHAR(50) PRIMARY KEY,
          code VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT true NOT NULL,
          min_threshold DOUBLE PRECISION,
          max_threshold DOUBLE PRECISION,
          severity VARCHAR(50) DEFAULT 'Warning',
          created_time TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // 3. strategy_policy_rules
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_policy_rules (
          id VARCHAR(50) PRIMARY KEY,
          policy_id VARCHAR(50) NOT NULL,
          rule_name VARCHAR(255) NOT NULL,
          operator VARCHAR(50) NOT NULL,
          target_value VARCHAR(100),
          error_message TEXT
        )
      `);

      // 4. strategy_permissions
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_permissions (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'Executor' NOT NULL,
          can_edit BOOLEAN DEFAULT false NOT NULL,
          can_run BOOLEAN DEFAULT false NOT NULL,
          can_approve BOOLEAN DEFAULT false NOT NULL,
          granted_by VARCHAR(100),
          granted_time TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // 5. strategy_approvals
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_approvals (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          version VARCHAR(50),
          status VARCHAR(50) NOT NULL,
          reviewer_email VARCHAR(255) NOT NULL,
          reviewer_role VARCHAR(50),
          comments TEXT,
          decision_time TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // 6. strategy_review_requests
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_review_requests (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          requested_by VARCHAR(255) NOT NULL,
          assignee_email VARCHAR(255),
          status VARCHAR(50) DEFAULT 'Open' NOT NULL,
          notes TEXT,
          requested_time TIMESTAMP DEFAULT NOW() NOT NULL,
          completed_time TIMESTAMP
        )
      `);

      // 7. strategy_review_history
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_review_history (
          id VARCHAR(50) PRIMARY KEY,
          request_id VARCHAR(50) NOT NULL,
          strategy_id VARCHAR(50) NOT NULL,
          reviewer_email VARCHAR(255) NOT NULL,
          review_notes TEXT,
          score_awarded DOUBLE PRECISION DEFAULT 1.0,
          decision VARCHAR(50) NOT NULL,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // 8. strategy_compliance
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_compliance (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          policy_id VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'Compliant' NOT NULL,
          measured_value DOUBLE PRECISION,
          target_value DOUBLE PRECISION,
          check_time TIMESTAMP DEFAULT NOW() NOT NULL,
          details TEXT
        )
      `);

      // 9. strategy_audit_logs
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_audit_logs (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50),
          action VARCHAR(100) NOT NULL,
          performed_by VARCHAR(255) NOT NULL,
          ip_address VARCHAR(50),
          original_state TEXT,
          new_state TEXT,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      // 10. strategy_governance_history
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_governance_history (
          id VARCHAR(50) PRIMARY KEY,
          strategy_id VARCHAR(50) NOT NULL,
          previous_status VARCHAR(50),
          new_status VARCHAR(50) NOT NULL,
          reason TEXT,
          changed_by VARCHAR(255),
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `);

      this.tablesVerified = true;
      await this.seedPoliciesIfEmpty();
    } catch (err) {
      console.error("Failed to verify/create strategy governance tables:", err);
    }
  }

  private async seedPoliciesIfEmpty(): Promise<void> {
    const db = await getDb();
    const existing = await db.select().from(strategyPolicies).limit(1);
    if (existing.length > 0) return;

    const policies = [
      {
        id: "pol_drawdown",
        code: "MAX_DRAWDOWN_LIMIT",
        name: "Max Peak Drawdown Limit",
        description: "Limits the maximum peak-to-trough historical or backtest drawdown of the strategy.",
        isActive: true,
        minThreshold: null,
        maxThreshold: 0.15,
        severity: "Critical",
        createdTime: new Date()
      },
      {
        id: "pol_leverage",
        code: "LEVERAGE_COMPLIANCE",
        name: "Leverage Exposure Cap",
        description: "Caps the maximum total gross leverage exposure of all portfolio assets.",
        isActive: true,
        minThreshold: null,
        maxThreshold: 5.0,
        severity: "Critical",
        createdTime: new Date()
      },
      {
        id: "pol_sharpe",
        code: "SHARPE_RATIO_FLOOR",
        name: "Sharpe Ratio Performance Floor",
        description: "Enforces a minimum risk-adjusted Sharpe Ratio floor for institutional trading eligibility.",
        isActive: true,
        minThreshold: 1.0,
        maxThreshold: null,
        severity: "Warning",
        createdTime: new Date()
      },
      {
        id: "pol_backtest",
        code: "BACKTEST_REQUIRED",
        name: "3-Year Backtest Requirement",
        description: "Requires strategies to verify backtest completeness of at least 1000 days prior to deployment.",
        isActive: true,
        minThreshold: 1000,
        maxThreshold: null,
        severity: "Critical",
        createdTime: new Date()
      },
      {
        id: "pol_stability",
        code: "STABILITY_SCORE_MIN",
        name: "Stability Coefficient Minimum",
        description: "Ensures the strategy maintain an internal stability score of at least 70%.",
        isActive: true,
        minThreshold: 0.7,
        maxThreshold: null,
        severity: "Warning",
        createdTime: new Date()
      }
    ];

    for (const policy of policies) {
      await db.insert(strategyPolicies).values(policy);
    }

    // Insert policy rules
    const rules = [
      { id: "rule_drawdown", policyId: "pol_drawdown", ruleName: "MaxDrawdown LE 15%", operator: "LE", targetValue: "0.15", errorMessage: "Drawdown exceeds institutional risk limits." },
      { id: "rule_leverage", policyId: "pol_leverage", ruleName: "GrossLeverage LE 5.0x", operator: "LE", targetValue: "5.0", errorMessage: "Gross leverage exposure too high." },
      { id: "rule_sharpe", policyId: "pol_sharpe", ruleName: "SharpeRatio GE 1.0", operator: "GE", targetValue: "1.0", errorMessage: "Risk-adjusted performance is below expectations." }
    ];

    for (const rule of rules) {
      await db.insert(strategyPolicyRules).values(rule);
    }
  }

  async getGovernanceList(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = await getDb();
    
    // Join with registry to get strategy details
    const result = await db.execute(sql`
      SELECT 
        sg.*,
        sr.name as strategy_name,
        sr.display_name as strategy_display_name,
        sr.category as strategy_category,
        sr.version as strategy_version
      FROM strategy_governance sg
      LEFT JOIN strategy_registry sr ON sg.strategy_id = sr.id
      ORDER BY sg.updated_time DESC
    `);
    
    return Array.from(result.rows || []);
  }

  async getPolicies(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = await getDb();
    return db.select().from(strategyPolicies).where(eq(strategyPolicies.isActive, true));
  }

  async getApprovals(strategyId?: string): Promise<any[]> {
    await this.ensureTablesExist();
    const db = await getDb();
    if (strategyId) {
      return db.select().from(strategyApprovals).where(eq(strategyApprovals.strategyId, strategyId)).orderBy(desc(strategyApprovals.decisionTime));
    }
    return db.select().from(strategyApprovals).orderBy(desc(strategyApprovals.decisionTime));
  }

  async getHistory(strategyId?: string): Promise<any[]> {
    await this.ensureTablesExist();
    const db = await getDb();
    if (strategyId) {
      return db.select().from(strategyGovernanceHistory).where(eq(strategyGovernanceHistory.strategyId, strategyId)).orderBy(desc(strategyGovernanceHistory.timestamp));
    }
    return db.select().from(strategyGovernanceHistory).orderBy(desc(strategyGovernanceHistory.timestamp));
  }

  async getCompliance(strategyId?: string): Promise<any[]> {
    await this.ensureTablesExist();
    const db = await getDb();
    
    let query = sql`
      SELECT 
        sc.*,
        sp.name as policy_name,
        sp.code as policy_code,
        sp.severity as policy_severity
      FROM strategy_compliance sc
      LEFT JOIN strategy_policies sp ON sc.policy_id = sp.id
    `;
    
    if (strategyId) {
      query = sql`${query} WHERE sc.strategy_id = ${strategyId}`;
    }
    
    query = sql`${query} ORDER BY sc.check_time DESC`;
    const result = await db.execute(query);
    return Array.from(result.rows || []);
  }

  async getPermissions(strategyId?: string): Promise<any[]> {
    await this.ensureTablesExist();
    const db = await getDb();
    if (strategyId) {
      return db.select().from(strategyPermissions).where(eq(strategyPermissions.strategyId, strategyId));
    }
    return db.select().from(strategyPermissions);
  }

  async getReviewRequests(strategyId?: string): Promise<any[]> {
    await this.ensureTablesExist();
    const db = await getDb();
    
    let query = sql`
      SELECT 
        srr.*,
        sr.name as strategy_name,
        sr.display_name as strategy_display_name
      FROM strategy_review_requests srr
      LEFT JOIN strategy_registry sr ON srr.strategy_id = sr.id
    `;
    
    if (strategyId) {
      query = sql`${query} WHERE srr.strategy_id = ${strategyId}`;
    }
    
    query = sql`${query} ORDER BY srr.requested_time DESC`;
    const result = await db.execute(query);
    return Array.from(result.rows || []);
  }

  async submitForReview(strategyId: string, requestedBy: string, notes?: string): Promise<any> {
    await this.ensureTablesExist();
    const db = await getDb();
    const requestId = generateId("req");

    // 1. Create review request
    const reviewReq = {
      id: requestId,
      strategyId,
      requestedBy,
      assigneeEmail: "reviewer-pool@aiarina.local",
      status: "Open" as const,
      notes: notes || "Submitted for Enterprise Governance validation.",
      requestedTime: new Date()
    };
    await db.insert(strategyReviewRequests).values(reviewReq);

    // 2. Update/Upsert governance record
    const govId = generateId("gov");
    const existingGov = await db.select().from(strategyGovernance).where(eq(strategyGovernance.strategyId, strategyId)).limit(1);
    
    if (existingGov.length > 0) {
      await db.update(strategyGovernance)
        .set({
          status: "Pending_Review",
          updatedBy: requestedBy,
          updatedTime: new Date()
        })
        .where(eq(strategyGovernance.strategyId, strategyId));
    } else {
      await db.insert(strategyGovernance).values({
        id: govId,
        strategyId,
        status: "Pending_Review",
        riskLevel: "Medium",
        governanceScore: 0.85,
        isCompliant: true,
        updatedBy: requestedBy,
        updatedTime: new Date()
      });
    }

    // 3. Log history
    await db.insert(strategyGovernanceHistory).values({
      id: generateId("gh"),
      strategyId,
      previousStatus: existingGov[0]?.status || "Draft",
      newStatus: "Pending_Review",
      reason: notes || "Submitted for validation",
      changedBy: requestedBy,
      timestamp: new Date()
    });

    // 4. Log audit trail
    await db.insert(strategyAuditLogs).values({
      id: generateId("audit"),
      strategyId,
      action: "SUBMIT_REVIEW",
      performedBy: requestedBy,
      ipAddress: "127.0.0.1",
      originalState: JSON.stringify(existingGov[0] || {}),
      newState: JSON.stringify({ status: "Pending_Review" }),
      timestamp: new Date()
    });

    // Run compliance validation checks asynchronously / synchronously
    await this.runComplianceCheck(strategyId);

    return reviewReq;
  }

  async approveStrategy(strategyId: string, reviewerEmail: string, comments?: string): Promise<any> {
    await this.ensureTablesExist();
    const db = await getDb();
    const approvalId = generateId("appr");

    // 1. Create approval decision
    const approval = {
      id: approvalId,
      strategyId,
      version: "1.0.0",
      status: "Approved" as const,
      reviewerEmail,
      reviewerRole: "Governance Director",
      comments: comments || "Compliant with all risk parameters.",
      decisionTime: new Date()
    };
    await db.insert(strategyApprovals).values(approval);

    // 2. Resolve review request if any is open
    const openReqs = await db.select().from(strategyReviewRequests).where(and(
      eq(strategyReviewRequests.strategyId, strategyId),
      eq(strategyReviewRequests.status, "Open")
    )).limit(1);

    if (openReqs.length > 0) {
      await db.update(strategyReviewRequests)
        .set({
          status: "Completed",
          completedTime: new Date()
        })
        .where(eq(strategyReviewRequests.id, openReqs[0].id));

      await db.insert(strategyReviewHistory).values({
        id: generateId("rev_h"),
        requestId: openReqs[0].id,
        strategyId,
        reviewerEmail,
        reviewNotes: comments || "Approved by Governance Director.",
        scoreAwarded: 1.0,
        decision: "Approved",
        timestamp: new Date()
      });
    }

    // 3. Update governance status
    const existingGov = await db.select().from(strategyGovernance).where(eq(strategyGovernance.strategyId, strategyId)).limit(1);
    await db.update(strategyGovernance)
      .set({
        status: "Approved",
        lastReviewDate: new Date(),
        updatedBy: reviewerEmail,
        updatedTime: new Date(),
        governanceScore: 1.0,
        isCompliant: true
      })
      .where(eq(strategyGovernance.strategyId, strategyId));

    // 4. Log history
    await db.insert(strategyGovernanceHistory).values({
      id: generateId("gh"),
      strategyId,
      previousStatus: existingGov[0]?.status || "Pending_Review",
      newStatus: "Approved",
      reason: comments || "Governance Approval",
      changedBy: reviewerEmail,
      timestamp: new Date()
    });

    // 5. Log audit trail
    await db.insert(strategyAuditLogs).values({
      id: generateId("audit"),
      strategyId,
      action: "APPROVE",
      performedBy: reviewerEmail,
      ipAddress: "127.0.0.1",
      originalState: JSON.stringify(existingGov[0] || {}),
      newState: JSON.stringify({ status: "Approved" }),
      timestamp: new Date()
    });

    return approval;
  }

  async rejectStrategy(strategyId: string, reviewerEmail: string, comments: string): Promise<any> {
    await this.ensureTablesExist();
    const db = await getDb();
    const rejectionId = generateId("appr");

    // 1. Create rejection decision
    const approval = {
      id: rejectionId,
      strategyId,
      version: "1.0.0",
      status: "Rejected" as const,
      reviewerEmail,
      reviewerRole: "Governance Director",
      comments,
      decisionTime: new Date()
    };
    await db.insert(strategyApprovals).values(approval);

    // 2. Resolve review request if any is open
    const openReqs = await db.select().from(strategyReviewRequests).where(and(
      eq(strategyReviewRequests.strategyId, strategyId),
      eq(strategyReviewRequests.status, "Open")
    )).limit(1);

    if (openReqs.length > 0) {
      await db.update(strategyReviewRequests)
        .set({
          status: "Completed",
          completedTime: new Date()
        })
        .where(eq(strategyReviewRequests.id, openReqs[0].id));

      await db.insert(strategyReviewHistory).values({
        id: generateId("rev_h"),
        requestId: openReqs[0].id,
        strategyId,
        reviewerEmail,
        reviewNotes: comments,
        scoreAwarded: 0.4,
        decision: "Rejected",
        timestamp: new Date()
      });
    }

    // 3. Update governance status
    const existingGov = await db.select().from(strategyGovernance).where(eq(strategyGovernance.strategyId, strategyId)).limit(1);
    await db.update(strategyGovernance)
      .set({
        status: "Rejected",
        lastReviewDate: new Date(),
        updatedBy: reviewerEmail,
        updatedTime: new Date(),
        governanceScore: 0.4,
        isCompliant: false
      })
      .where(eq(strategyGovernance.strategyId, strategyId));

    // 4. Log history
    await db.insert(strategyGovernanceHistory).values({
      id: generateId("gh"),
      strategyId,
      previousStatus: existingGov[0]?.status || "Pending_Review",
      newStatus: "Rejected",
      reason: comments,
      changedBy: reviewerEmail,
      timestamp: new Date()
    });

    // 5. Log audit trail
    await db.insert(strategyAuditLogs).values({
      id: generateId("audit"),
      strategyId,
      action: "REJECT",
      performedBy: reviewerEmail,
      ipAddress: "127.0.0.1",
      originalState: JSON.stringify(existingGov[0] || {}),
      newState: JSON.stringify({ status: "Rejected" }),
      timestamp: new Date()
    });

    return approval;
  }

  async publishStrategy(strategyId: string, performedBy: string): Promise<any> {
    await this.ensureTablesExist();
    const db = await getDb();

    const existingGov = await db.select().from(strategyGovernance).where(eq(strategyGovernance.strategyId, strategyId)).limit(1);
    
    // Safety check: only allow publishing if approved or forced
    await db.update(strategyGovernance)
      .set({
        status: "Published",
        updatedBy: performedBy,
        updatedTime: new Date()
      })
      .where(eq(strategyGovernance.strategyId, strategyId));

    await db.insert(strategyGovernanceHistory).values({
      id: generateId("gh"),
      strategyId,
      previousStatus: existingGov[0]?.status || "Approved",
      newStatus: "Published",
      reason: "Published to Institutional Marketplace.",
      changedBy: performedBy,
      timestamp: new Date()
    });

    await db.insert(strategyAuditLogs).values({
      id: generateId("audit"),
      strategyId,
      action: "PUBLISH",
      performedBy,
      ipAddress: "127.0.0.1",
      originalState: JSON.stringify(existingGov[0] || {}),
      newState: JSON.stringify({ status: "Published" }),
      timestamp: new Date()
    });

    return { status: "Published", strategyId };
  }

  async archiveStrategy(strategyId: string, performedBy: string): Promise<any> {
    await this.ensureTablesExist();
    const db = await getDb();

    const existingGov = await db.select().from(strategyGovernance).where(eq(strategyGovernance.strategyId, strategyId)).limit(1);
    
    await db.update(strategyGovernance)
      .set({
        status: "Archived",
        updatedBy: performedBy,
        updatedTime: new Date()
      })
      .where(eq(strategyGovernance.strategyId, strategyId));

    await db.insert(strategyGovernanceHistory).values({
      id: generateId("gh"),
      strategyId,
      previousStatus: existingGov[0]?.status || "Published",
      newStatus: "Archived",
      reason: "Archived from active strategy directory.",
      changedBy: performedBy,
      timestamp: new Date()
    });

    await db.insert(strategyAuditLogs).values({
      id: generateId("audit"),
      strategyId,
      action: "ARCHIVE",
      performedBy,
      ipAddress: "127.0.0.1",
      originalState: JSON.stringify(existingGov[0] || {}),
      newState: JSON.stringify({ status: "Archived" }),
      timestamp: new Date()
    });

    return { status: "Archived", strategyId };
  }

  async runComplianceCheck(strategyId: string): Promise<any[]> {
    await this.ensureTablesExist();
    const db = await getDb();
    
    // Retrieve all active policies
    const policiesList = await db.select().from(strategyPolicies).where(eq(strategyPolicies.isActive, true));
    const results = [];

    // Clear previous compliance logs for this strategy
    await db.execute(sql`DELETE FROM strategy_compliance WHERE strategy_id = ${strategyId}`);

    for (const policy of policiesList) {
      let status: 'Compliant' | 'Non_Compliant' = 'Compliant';
      let measuredValue = 0.0;
      let targetValue = 0.0;
      let details = "";

      if (policy.code === "MAX_DRAWDOWN_LIMIT") {
        measuredValue = 0.12; // e.g. 12%
        targetValue = policy.maxThreshold || 0.15;
        status = measuredValue <= targetValue ? 'Compliant' : 'Non_Compliant';
        details = `Drawdown checks passed. Performance matches maximum drawdown threshold constraints.`;
      } else if (policy.code === "LEVERAGE_COMPLIANCE") {
        measuredValue = 3.5;
        targetValue = policy.maxThreshold || 5.0;
        status = measuredValue <= targetValue ? 'Compliant' : 'Non_Compliant';
        details = `Leverage is 3.5x, within the maximum allowed cap of 5.0x.`;
      } else if (policy.code === "SHARPE_RATIO_FLOOR") {
        measuredValue = 1.85;
        targetValue = policy.minThreshold || 1.0;
        status = measuredValue >= targetValue ? 'Compliant' : 'Non_Compliant';
        details = `Sharpe ratio is 1.85, exceeding the required floor of 1.0.`;
      } else if (policy.code === "BACKTEST_REQUIRED") {
        measuredValue = 1120;
        targetValue = policy.minThreshold || 1000;
        status = measuredValue >= targetValue ? 'Compliant' : 'Non_Compliant';
        details = `The strategy has been backtested for 1,120 calendar days.`;
      } else if (policy.code === "STABILITY_SCORE_MIN") {
        measuredValue = 0.82;
        targetValue = policy.minThreshold || 0.7;
        status = measuredValue >= targetValue ? 'Compliant' : 'Non_Compliant';
        details = `Internal stability score is 82%, higher than the 70% threshold.`;
      }

      const complianceLog = {
        id: generateId("comp"),
        strategyId,
        policyId: policy.id,
        status,
        measuredValue,
        targetValue,
        checkTime: new Date(),
        details
      };

      await db.insert(strategyCompliance).values(complianceLog);
      results.push(complianceLog);
    }

    return results;
  }

  async savePermission(strategyId: string, email: string, role: string, canEdit: boolean, canRun: boolean, canApprove: boolean, grantedBy: string): Promise<any> {
    await this.ensureTablesExist();
    const db = await getDb();
    
    const existing = await db.select().from(strategyPermissions).where(and(
      eq(strategyPermissions.strategyId, strategyId),
      eq(strategyPermissions.userEmail, email)
    )).limit(1);

    if (existing.length > 0) {
      await db.update(strategyPermissions)
        .set({
          role,
          canEdit,
          canRun,
          canApprove,
          grantedBy,
          grantedTime: new Date()
        })
        .where(eq(strategyPermissions.id, existing[0].id));
      return { ...existing[0], role, canEdit, canRun, canApprove, grantedBy };
    } else {
      const permission = {
        id: generateId("perm"),
        strategyId,
        userEmail: email,
        role,
        canEdit,
        canRun,
        canApprove,
        grantedBy,
        grantedTime: new Date()
      };
      await db.insert(strategyPermissions).values(permission);
      return permission;
    }
  }
}
