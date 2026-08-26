from app.monitoring.incident import IncidentSeverity, IncidentStatus

from app.monitoring.correlation import CorrelationEngine
from app.monitoring.incident_engine import IncidentEngine


def test_correlation_engine_incident_creation():
    CorrelationEngine.reset()
    inc1 = CorrelationEngine.process_security_event(
        event_type="REPLAY_ATTACK",
        correlation_id="corr_test_12345",
        description="Replayed nonce detected in test execution.",
        severity=IncidentSeverity.HIGH
    )
    assert inc1.incident_id.startswith("inc_")
    assert inc1.severity == IncidentSeverity.HIGH
    assert inc1.event_count == 1

    # Second event with same correlation_id increments event count
    inc2 = CorrelationEngine.process_security_event(
        event_type="REPLAY_ATTACK",
        correlation_id="corr_test_12345",
        description="Second replay attempt.",
        severity=IncidentSeverity.HIGH
    )
    assert inc2.incident_id == inc1.incident_id
    assert inc2.event_count == 2


def test_incident_status_transition():
    CorrelationEngine.reset()
    inc = CorrelationEngine.process_security_event(
        event_type="FORGERY_ATTACK",
        correlation_id="corr_test_67890",
        description="Forgery attempt.",
        severity=IncidentSeverity.CRITICAL
    )
    assert inc.status == IncidentStatus.OPEN

    updated = IncidentEngine.transition_status(inc.incident_id, IncidentStatus.INVESTIGATING)
    assert updated.status == IncidentStatus.INVESTIGATING

    resolved = IncidentEngine.transition_status(inc.incident_id, IncidentStatus.RESOLVED)
    assert resolved.status == IncidentStatus.RESOLVED


def test_alert_generation():
    CorrelationEngine.reset()
    CorrelationEngine.process_security_event(
        event_type="UNAUTHORIZED_ACCESS",
        correlation_id="corr_test_alert",
        description="Unauthorized verification request.",
        severity=IncidentSeverity.MEDIUM
    )
    alerts = CorrelationEngine.get_alerts()
    assert len(alerts) >= 1
    assert alerts[0].severity == IncidentSeverity.MEDIUM
