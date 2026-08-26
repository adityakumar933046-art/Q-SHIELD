from app.audit.event import AuditEvent, AuditEventCategory, AuditSeverity, calculate_event_checksum


def test_audit_event_checksum_integrity():
    event = AuditEvent(
        event_type="USER_LOGIN",
        category=AuditEventCategory.AUTHENTICATION,
        severity=AuditSeverity.INFO,
        action="USER_AUTHENTICATED",
        actor_id="user_123",
        details={"ip": "127.0.0.1"}
    )

    chk1 = event.compute_and_set_checksum()
    assert len(chk1) == 64  # SHA-256 hex string length
    assert event.verify_integrity() is True

    # Mutate details to simulate log tampering
    event.details["ip"] = "192.168.1.100"
    assert event.verify_integrity() is False
