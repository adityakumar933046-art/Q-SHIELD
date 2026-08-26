from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.database import Base
from app.database.models import User
from app.qds.protocol import QDSProtocol
from app.qds.signature import calculate_message_digest
from app.verification.verification_engine import VerificationEngine
from app.verification.decision_engine import VerificationDecision
from app.security.identity import IdentityContext


def test_qds_signing_and_verification_evidence_pipeline():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    db = TestingSession()

    user = User(username="signer_alice", email="alice@qshield.org")
    db.add(user)
    db.commit()
    db.refresh(user)

    protocol = QDSProtocol()
    session = protocol.initialize_session(signer_id=user.id)

    message = "Secret QDS Message Payload"
    signature = protocol.create_signature(message=message, signer_id=user.id, session=session, db=db)

    assert signature.signature_id is not None
    assert signature.message_digest == calculate_message_digest(message)

    evidence = protocol.verify_signature(
        signature=signature,
        message=message,
        session=session,
        verifier_id=user.id,
        db=db
    )

    assert evidence.signature_valid is True
    assert evidence.message_match is True
    assert evidence.session_valid is True
    assert evidence.replay_detected is False

    db.close()


def test_verification_engine_end_to_end_accept():
    engine_db = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine_db)
    TestingSession = sessionmaker(bind=engine_db)
    db = TestingSession()

    signer = User(username="alice_signer", email="alice_s@qshield.org")
    verifier = User(username="bob_verifier", email="bob_v@qshield.org")
    db.add_all([signer, verifier])
    db.commit()

    protocol = QDSProtocol()
    session = protocol.initialize_session(signer_id=signer.id)

    message = "Canonical Contract Terms"
    signature = protocol.create_signature(message=message, signer_id=signer.id, session=session, db=db)

    v_engine = VerificationEngine(threshold=0.85)
    v_identity = IdentityContext(user_id=verifier.id, username=verifier.username, roles=["VERIFIER"])

    res = v_engine.verify_signature(
        signature_id=signature.signature_id,
        message=message,
        verifier_identity=v_identity,
        db=db
    )

    assert res.decision == VerificationDecision.ACCEPT
    assert res.message_match is True
    assert res.threshold == 0.85
    assert len(res.reasons) > 0

    db.close()


def test_verification_engine_tampered_message_reject():
    engine_db = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine_db)
    TestingSession = sessionmaker(bind=engine_db)
    db = TestingSession()

    signer = User(username="carol_signer", email="carol_s@qshield.org")
    verifier = User(username="dave_verifier", email="dave_v@qshield.org")
    db.add_all([signer, verifier])
    db.commit()

    protocol = QDSProtocol()
    session = protocol.initialize_session(signer_id=signer.id)

    message = "Original Valid Message"
    signature = protocol.create_signature(message=message, signer_id=signer.id, session=session, db=db)

    v_engine = VerificationEngine(threshold=0.85)
    v_identity = IdentityContext(user_id=verifier.id, username=verifier.username, roles=["VERIFIER"])

    # Attempt verification with TAMPERED message
    res = v_engine.verify_signature(
        signature_id=signature.signature_id,
        message="TAMPERED Message Payload",
        verifier_identity=v_identity,
        db=db
    )

    assert res.decision == VerificationDecision.REJECT
    assert res.message_match is False

    db.close()
