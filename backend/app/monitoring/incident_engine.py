from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.monitoring.incident import Incident, IncidentStatus, IncidentSeverity
from app.monitoring.correlation import CorrelationEngine
from app.audit.logger import AuditLogger
from app.audit.event import AuditEventCategory, AuditSeverity


class IncidentEngine:
    """Manages Incident lifecycles, state transitions, and audit trail linkage."""

    @staticmethod
    def transition_status(
        incident_id: str,
        new_status: IncidentStatus,
        actor_id: Optional[str] = None,
        db: Optional[Session] = None
    ) -> Incident:
        incidents = CorrelationEngine.get_incidents()
        target = next((i for i in incidents if i.incident_id == incident_id), None)

        if not target:
            raise ValueError(f"Incident '{incident_id}' not found.")

        target.status = new_status
        target.updated_at = target.updated_at.now()

        if db:
            AuditLogger.log_event(
                event_type="INCIDENT_STATUS_TRANSITION",
                category=AuditEventCategory.SECURITY,
                severity=AuditSeverity.INFO,
                action=f"TRANSITION_{new_status.value}",
                actor_id=actor_id,
                db=db,
                metadata={"incident_id": incident_id, "new_status": new_status.value}
            )

        return target
