# AI Arena V1 - Operational Runbook (Stage 12.7)

This document provides procedures for backup, restore, disaster recovery, and business continuity for the AI Arena platform.

## 1. Backup Procedures

### 1.1 Database Backups (Automated)
*   **Provider**: Google Cloud SQL (PostgreSQL)
*   **Type**: Full automated backups + Point-in-Time Recovery (PITR) via write-ahead logs (WAL).
*   **Schedule**: Daily full backups at 02:00 UTC.
*   **Retention**: 30 days of full backups; 7 days of PITR logs.
*   **Verification**: Check Cloud SQL console for "Last backup status: Successful".

### 1.2 Configuration & Secrets (Manual)
*   **Location**: AI Studio Settings / Environment Variables.
*   **Backup Frequency**: After every configuration change.
*   **Procedure**:
    1.  Export current `.env` configuration to a secure vault (e.g., Google Secret Manager).
    2.  Maintain `infrastructure/config/env.ts` as the single source of truth for schema validation.

## 2. Restore Procedures

### 2.1 Database Restore
1.  Identify the target timestamp or backup ID.
2.  In Cloud SQL console, select "Restore".
3.  Choose "Point-in-Time Recovery" if a specific transaction needs to be reversed, otherwise choose the latest full backup.
4.  Restore to a new instance for verification before swapping traffic.

### 2.2 Application Recovery
1.  Deploy the latest stable build from the main branch.
2.  Verify environment variables are correctly populated.
3.  The application will automatically run `RecoveryService.reconcile()` on startup to handle transient states.

## 3. Disaster Recovery (DR) Checklist

- [ ] **Verify Connectivity**: Test database connection string and AI provider API keys.
- [ ] **Run Reconciliation**: Check logs for `RECOVERY_COMPLETE` event.
- [ ] **Check Orders**: Run `SELECT count(*) FROM orders WHERE status IN ('EXECUTING', 'QUEUED')` (Should be 0 after reconciliation).
- [ ] **Check AI Health**: Verify AI adapters are receiving successful responses.
- [ ] **Audit Trail**: Ensure `audit_events` table is receiving new entries.

## 4. Business Continuity Strategy

### 4.1 AI Provider Outage
*   **Detection**: Performance tracker logs `AI_FAILURE` events.
*   **Mechanism**: Adapters implement exponential backoff retry.
*   **Fallback**: If OpenRouter fails, the system attempts to route critical tasks via direct Gemini API (if configured).

### 4.2 Application Crash
*   **Recovery**: The platform automatically restarts the container.
*   **State Persistence**: All critical trading state (Orders, Positions, Portfolio) is persisted in Postgres, ensuring 0% data loss on restart.

### 4.3 Database Network Interruption
*   **Resiliency**: `postgres-js` client automatically reconnects. 
*   **Safety**: Transactions are used for all multi-step operations (Trading, AI costs) to ensure atomicity.

## 5. Incident Response Runbook

1.  **Alerting**: Monitor `system_events` for `CRITICAL` or `ERROR` levels.
2.  **Triage**: Identify if the failure is External (AI Provider, DB Network) or Internal (Bug, OOM).
3.  **Resolution**: Apply retry logic, scale resources, or rollback deployment.
4.  **Post-Mortem**: Log the incident in the `administration_logs` table.
