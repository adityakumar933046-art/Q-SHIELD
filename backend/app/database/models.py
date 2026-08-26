import uuid
from datetime import datetime, timezone
from typing import List, Optional, Any
from sqlalchemy import String, Boolean, DateTime, Float, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="USER", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    signatures: Mapped[List["Signature"]] = relationship("Signature", back_populates="signer", cascade="all, delete-orphan")
    verifications: Mapped[List["Verification"]] = relationship("Verification", back_populates="verifier", cascade="all, delete-orphan")
    security_events: Mapped[List["SecurityEvent"]] = relationship("SecurityEvent", back_populates="user", cascade="all, delete-orphan")


class Signature(Base):
    __tablename__ = "signatures"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    signature_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    signer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message_reference: Mapped[str] = mapped_column(String(255), nullable=False)
    signature_data: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    signer: Mapped["User"] = relationship("User", back_populates="signatures")
    measurements: Mapped[List["Measurement"]] = relationship("Measurement", back_populates="signature", cascade="all, delete-orphan")
    verifications: Mapped[List["Verification"]] = relationship("Verification", back_populates="signature", cascade="all, delete-orphan")
    attacks: Mapped[List["Attack"]] = relationship("Attack", back_populates="target_signature", cascade="all, delete-orphan")


class Measurement(Base):
    __tablename__ = "measurements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    signature_id: Mapped[str] = mapped_column(String(36), ForeignKey("signatures.id", ondelete="CASCADE"), nullable=False)
    measurement_data: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    basis: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    result: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    shot_count: Mapped[int] = mapped_column(Integer, default=1024, nullable=False)
    error_info: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    signature: Mapped["Signature"] = relationship("Signature", back_populates="measurements")


class Verification(Base):
    __tablename__ = "verifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    signature_id: Mapped[str] = mapped_column(String(36), ForeignKey("signatures.id", ondelete="CASCADE"), nullable=False)
    verifier_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    result: Mapped[str] = mapped_column(String(50), nullable=False)
    error_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    threshold: Mapped[float] = mapped_column(Float, default=0.89, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.95, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    signature: Mapped["Signature"] = relationship("Signature", back_populates="verifications")
    verifier: Mapped["User"] = relationship("User", back_populates="verifications")


class Attack(Base):
    __tablename__ = "attacks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    attack_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target_signature_id: Mapped[str] = mapped_column(String(36), ForeignKey("signatures.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="INITIATED", nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="LOW", nullable=False)
    parameters: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    result: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    target_signature: Mapped["Signature"] = relationship("Signature", back_populates="attacks")


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), default="INFO", nullable=False)
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    event_metadata: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="security_events")
