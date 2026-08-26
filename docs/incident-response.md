# Q-SHIELD Incident Response & Security Observability Manual

## 1. Operational Incident Response Architecture

Q-SHIELD Phase 18 introduces a declarative Security Event Correlation & Incident Response Engine (`backend/app/monitoring/`) connecting existing security, threat, and audit engines into a unified operational monitoring pipeline.

```text
                         Q-SHIELD
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          FRONTEND       BACKEND        QUANTUM
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                     SECURITY EVENTS
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        Threat Engine    Audit Engine   Statistics
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                  EVENT CORRELATION
                            │
                            ▼
                    INCIDENT ENGINE
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          ALERTS        INCIDENTS       METRICS
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                         DASHBOARD
```

## 2. Incident State Machine & Transitions

- **`OPEN`**: Initial state upon automatic event correlation.
- **`INVESTIGATING`**: Under active triage by security analyst or admin (`SECURITY_ANALYST` / `ADMIN` role required).
- **`CONTAINED`**: Threat isolated via automated replay blocking or session flagging.
- **`RESOLVED`**: Root cause verified and mitigated.
- **`CLOSED`**: Incident review finalized and archived.

## 3. Incident Severity Levels & Triage SLA

| Severity | Definition | Event Correlation Trigger | Triage SLA |
| :--- | :--- | :--- | :--- |
| **`CRITICAL`** | Direct Forgery or Channel Tampering Attack | Multiple signature digest modifications | < 5 Minutes |
| **`HIGH`** | Replay or Privilege Escalation Attempt | Replayed nonces or unauthorized admin calls | < 15 Minutes |
| **`MEDIUM`** | Repeated Verification Failures | Exceeds boundary noise thresholds | < 1 Hour |
| **`LOW` / `INFO`** | General System Warnings | System status changes / routine health metrics | Batch Review |

## 4. Forensic Timeline Integration

Every incident links directly to historical event hash chains via `correlation_id`. Incident state transitions produce append-only audit events logged by `AuditLogger` and verified via `ForensicEngine.investigate()`.
