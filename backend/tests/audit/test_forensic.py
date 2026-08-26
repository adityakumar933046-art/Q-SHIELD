from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.database import Base
from app.audit.logger import AuditLogger
from app.audit.event import AuditEventCategory, AuditSeverity
from app.audit.forensic import ForensicEngine


def test_forensic_engine_investigation():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    db = TestingSession()

    # Create test audit logs
    AuditLogger.log_event(
        event_type="REPLAY_ATTACK_DETECTED",
        category=AuditEventCategory.SECURITY,
        severity=AuditSeverity.CRITICAL,
        action="REPLAY_BLOCKED",
        actor_id="attacker_01",
        db=db
    )


    res = ForensicEngine.investigate(actor_id="attacker_01", db=db)

    assert res.total_events_analyzed >= 1
    assert res.integrity_verified is True
    assert res.tampered_events_detected == 0
    assert len(res.threat_patterns_found) >= 1

    db.close()
