from app.security.identity import hash_password, verify_password, create_access_token, decode_access_token, IdentityContext


def test_password_hashing_and_verification():
    raw_pwd = "SuperSecretPassword123!"
    hashed = hash_password(raw_pwd)
    
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_access_token_creation_and_decoding():
    payload = {"sub": "user-uuid-123", "username": "alice", "role": "USER"}
    token = create_access_token(payload)
    
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "user-uuid-123"
    assert decoded["username"] == "alice"
    assert decoded["role"] == "USER"


def test_invalid_token_decoding():
    assert decode_access_token("invalid.token.value") is None
