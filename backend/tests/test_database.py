from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.database import Base


def test_database_initialization():
    engine = create_engine("sqlite:///:memory:")
    TestingSession = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSession()
    assert session is not None
    session.close()
