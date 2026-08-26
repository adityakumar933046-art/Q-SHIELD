from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.database import Base
from app.database.models import User
from app.qds.protocol import QDSProtocol
from app.attacks.replay import ReplayAttack


def test_replay_attack_simulation_blocked():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    db = TestingSession()

    user = User(username="bob", email="bob@qshield.org")
    db.add(user)
    db.commit()

    protocol = QDSProtocol()
    session = protocol.initialize_session(signer_id=user.id)
    message = "Message to Replay"
    sig = protocol.create_signature(message=message, signer_id=user.id, session=session, db=db)

    attack = ReplayAttack(target="local_qshield")
    result = attack.run_simulation(signature_id=sig.signature_id, message=message, db=db)

    assert result.blocked is True
    assert result.detected is True
    assert result.success is False

    db.close()
