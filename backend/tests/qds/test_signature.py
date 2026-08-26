from app.qds.signature import QDSSignature, calculate_message_digest, QDSSignatureStatus
from app.qds.session import create_qds_session, QDSSessionState


def test_calculate_message_digest():
    msg1 = "Hello Q-SHIELD"
    msg2 = "Hello Q-SHIELD"
    msg3 = "Hello Q-SHIELD Modified"

    d1 = calculate_message_digest(msg1)
    d2 = calculate_message_digest(msg2)
    d3 = calculate_message_digest(msg3)

    assert d1 == d2
    assert d1 != d3
    assert len(d1) == 64  # SHA-256 hex string length


def test_qds_session_state_machine():
    session = create_qds_session(signer_id="user-123")
    assert session.state == QDSSessionState.INITIALIZED

    session.transition_to(QDSSessionState.SIGNING)
    assert session.state == QDSSessionState.SIGNING

    session.transition_to(QDSSessionState.SIGNED)
    assert session.state == QDSSessionState.SIGNED


def test_signature_serialization():
    sig = QDSSignature(
        signer_id="user-456",
        message_digest=calculate_message_digest("Test Data"),
        session_id="sess-789",
        nonce="nonce-abc"
    )
    d = sig.model_dump()
    assert d["signer_id"] == "user-456"
    assert d["status"] == QDSSignatureStatus.CREATED
