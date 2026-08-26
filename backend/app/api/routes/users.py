from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.repositories import UserRepository, SecurityEventRepository
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.security.identity import hash_password, verify_password, create_access_token, IdentityContext
from app.api.dependencies import require_authenticated_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    return repo.list(skip=skip, limit=limit)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    if repo.get_by_username(user_in.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if repo.get_by_email(user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    pwd_hash = hash_password(user_in.password)
    user = repo.create(
        username=user_in.username,
        email=user_in.email,
        password_hash=pwd_hash,
        role=user_in.role,
        is_active=user_in.is_active
    )

    sec_repo = SecurityEventRepository(db)
    sec_repo.create(
        event_type="USER_REGISTERED",
        severity="INFO",
        user_id=user.id,
        description=f"User registered: {user.username}"
    )

    return user


@router.post("/login", response_model=TokenResponse)
def login_user(login_in: UserLogin, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    user = repo.get_by_username(login_in.username)
    
    sec_repo = SecurityEventRepository(db)

    if not user or not user.password_hash or not verify_password(login_in.password, user.password_hash):
        if user:
            sec_repo.create(
                event_type="LOGIN_FAILED",
                severity="WARNING",
                user_id=user.id,
                description=f"Invalid credentials for user: {login_in.username}"
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        sec_repo.create(
            event_type="ACCOUNT_INACTIVE",
            severity="WARNING",
            user_id=user.id,
            description=f"Inactive account login attempt: {user.username}"
        )
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    # Update last login timestamp
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    sec_repo.create(
        event_type="LOGIN_SUCCESS",
        severity="INFO",
        user_id=user.id,
        description=f"User logged in: {user.username}"
    )

    token = create_access_token({"sub": user.id, "username": user.username, "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    identity: IdentityContext = Depends(require_authenticated_user),
    db: Session = Depends(get_db)
):
    repo = UserRepository(db)
    user = repo.get_by_id(identity.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")
    return user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
