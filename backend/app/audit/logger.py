from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.audit.event import AuditEvent, AuditEventCategory, AuditSeverity
from app.database.repositories import SecurityEventRepository


class AuditLogger:
    """Master Audit Logger with SHA-256 tamper-evident checksum generation."""

    @staticmethod
    def log_event(
        event_type: str,
        category: AuditEventCategory,
        severity: AuditSeverity,
        action: str,
        actor_id: Optional[str] = None,
        resource_id: Optional[str] = None,
        status: str = "SUCCESS",
        details: Optional[Dict[str, Any]] = None,
        db: Session = None
    ) -> AuditEvent:
        """Create, checksum, and persist audit event."""
        event = AuditEvent(
            event_type=event_type,
            category=category,
            severity=severity,
            action=action,
            actor_id=actor_id,
            resource_id=resource_id,
            status=status,
            details=details or {}
        )
        event.compute_and_set_checksum()

        # Persist in database using SecurityEventRepository if session provided
        if db:
            repo = SecurityEventRepository(db)
            repo.create(
                event_type=event.event_type,
                severity=event.severity.value,
                user_id=event.actor_id,
                description=f"Action: {event.action} | Status: {event.status}",
                event_metadata={
                    "event_id": event.event_id,
                    "category": event.category.value,
                    "actor_id": event.actor_id,
                    "resource_id": event.resource_id,
                    "checksum": event.checksum,
                    "raw_details": event.details
                }
            )

        return event

