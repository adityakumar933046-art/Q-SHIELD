from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.database import Base
from app.database.models import User
from app.qds.protocol import QDSProtocol
from app.attacks.channel_manipulation import ChannelManipulationAttack


def test_channel_manipulation_attack_blocked():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    db = TestingSession()

    user = User(username="carol", email="carol@qshield.org")
    db.add(user)
    db.commit()

    protocol = QDSProtocol()
    session = protocol.initialize_session(signer_id=user.id)
    message = "Original Payload"
    sig = protocol.create_signature(message=message, signer_id=user.id, session=session, db=db)

    attack = ChannelManipulationAttack(target="local_qshield")
    result = attack.run_simulation(signature_id=sig.signature_id, original_message=message, db=db)

    assert result.blocked is True
    assert result.detected is True
    assert result.success is False

    db.close()
