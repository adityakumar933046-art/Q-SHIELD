import uuid
from typing import List, Dict, Any, Optional
from app.monitoring.incident import Incident, Alert, IncidentSeverity, IncidentStatus


class CorrelationEngine:
    """Correlates threat events, replay attempts, and verification rejections into incidents."""

    _active_incidents: Dict[str, Incident] = {}
    _active_alerts: Dict[str, Alert] = {}

    @classmethod
    def process_security_event(
        cls,
        event_type: str,
        correlation_id: str,
        description: str,
        severity: IncidentSeverity = IncidentSeverity.MEDIUM,
        event_id: Optional[str] = None
    ) -> Incident:
        inc_id = f"inc_{correlation_id[:8]}"
        existing = cls._active_incidents.get(inc_id)

        if existing:
            existing.event_count += 1
            existing.updated_at = existing.updated_at.now()
            if event_id and event_id not in existing.related_event_ids:
                existing.related_event_ids.append(event_id)
            if severity in [IncidentSeverity.HIGH, IncidentSeverity.CRITICAL]:
                existing.severity = severity
            return existing

        new_inc = Incident(
            incident_id=inc_id,
            title=f"Correlated Security Incident ({event_type})",
            severity=severity,
            status=IncidentStatus.OPEN,
            correlation_id=correlation_id,
            description=description,
            related_event_ids=[event_id] if event_id else []
        )
        cls._active_incidents[inc_id] = new_inc

        # Generate alert for MEDIUM+ incidents
        alert_id = f"alt_{uuid.uuid4().hex[:8]}"
        new_alert = Alert(
            alert_id=alert_id,
            incident_id=inc_id,
            severity=severity,
            message=description
        )
        cls._active_alerts[alert_id] = new_alert

        return new_inc

    @classmethod
    def get_incidents(cls) -> List[Incident]:
        return list(cls._active_incidents.values())

    @classmethod
    def get_alerts(cls) -> List[Alert]:
        return list(cls._active_alerts.values())

    @classmethod
    def reset(cls) -> None:
        cls._active_incidents.clear()
        cls._active_alerts.clear()
