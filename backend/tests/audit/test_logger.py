from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.database import Base
from app.audit.logger import AuditLogger
from app.audit.event import AuditEventCategory, AuditSeverity


def test_audit_logger_event_creation():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    db = TestingSession()

    event = AuditLogger.log_event(
        event_type="QDS_SIGNATURE_CREATED",
        category=AuditEventCategory.QDS_PROTOCOL,
        severity=AuditSeverity.INFO,
        action="SIGN_MESSAGE",
        actor_id="alice",
        resource_id="SIG-123",
        details={"message_length": 50},
        db=db
    )

    assert event.checksum != ""
    assert event.event_type == "QDS_SIGNATURE_CREATED"
    assert event.verify_integrity() is True

    db.close()
