from typing import List, Optional, Type, TypeVar, Generic
from sqlalchemy.orm import Session
from app.database.models import User, Signature, Measurement, Verification, Attack, SecurityEvent

T = TypeVar("T")


class BaseRepository(Generic[T]):
    def __init__(self, model: Type[T], session: Session):
        self.model = model
        self.session = session

    def create(self, **kwargs) -> T:
        instance = self.model(**kwargs)
        self.session.add(instance)
        self.session.commit()
        self.session.refresh(instance)
        return instance

    def get_by_id(self, id_val: str) -> Optional[T]:
        return self.session.query(self.model).filter(self.model.id == id_val).first()

    def list(self, skip: int = 0, limit: int = 100) -> List[T]:
        return self.session.query(self.model).offset(skip).limit(limit).all()

    def delete(self, id_val: str) -> bool:
        instance = self.get_by_id(id_val)
        if instance:
            self.session.delete(instance)
            self.session.commit()
            return True
        return False


class UserRepository(BaseRepository[User]):
    def __init__(self, session: Session):
        super().__init__(User, session)

    def get_by_username(self, username: str) -> Optional[User]:
        return self.session.query(User).filter(User.username == username).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.session.query(User).filter(User.email == email).first()


class SignatureRepository(BaseRepository[Signature]):
    def __init__(self, session: Session):
        super().__init__(Signature, session)

    def get_by_signature_id(self, signature_id: str) -> Optional[Signature]:
        return self.session.query(Signature).filter(Signature.signature_id == signature_id).first()


class MeasurementRepository(BaseRepository[Measurement]):
    def __init__(self, session: Session):
        super().__init__(Measurement, session)


class VerificationRepository(BaseRepository[Verification]):
    def __init__(self, session: Session):
        super().__init__(Verification, session)


class AttackRepository(BaseRepository[Attack]):
    def __init__(self, session: Session):
        super().__init__(Attack, session)


class SecurityEventRepository(BaseRepository[SecurityEvent]):
    def __init__(self, session: Session):
        super().__init__(SecurityEvent, session)
