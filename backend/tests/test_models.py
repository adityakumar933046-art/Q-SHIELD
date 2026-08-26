from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.database import Base
from app.database.models import User, Signature, Measurement, Verification, Attack, SecurityEvent


def test_model_instantiation_and_relationships():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()

    user = User(username="alice", email="alice@qshield.org")
    session.add(user)
    session.commit()
    session.refresh(user)

    assert user.id is not None
    assert user.username == "alice"
    assert user.is_active is True

    sig = Signature(
        signature_id="SIG-1001",
        signer_id=user.id,
        message_reference="msg_ref_001",
        status="VALID"
    )
    session.add(sig)
    session.commit()
    session.refresh(sig)

    assert sig.id is not None
    assert sig.signer.username == "alice"

    meas = Measurement(signature_id=sig.id, basis="Z", result="0", shot_count=1024)
    verif = Verification(signature_id=sig.id, verifier_id=user.id, result="ACCEPTED", error_rate=0.02)
    attack = Attack(attack_type="FORGERY", target_signature_id=sig.id, severity="HIGH")
    sec_evt = SecurityEvent(event_type="LOGIN", user_id=user.id, description="User logged in")

    session.add_all([meas, verif, attack, sec_evt])
    session.commit()

    assert len(sig.measurements) == 1
    assert len(sig.verifications) == 1
    assert len(sig.attacks) == 1
    assert len(user.security_events) == 1

    session.close()
