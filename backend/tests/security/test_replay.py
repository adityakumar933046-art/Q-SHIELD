try:
    import pytest
except ImportError:
    class PytestRaisesContext:
        def __init__(self, expected_exception):
            self.expected_exception = expected_exception
        def __enter__(self):
            return self
        def __exit__(self, exc_type, exc_val, exc_tb):
            if exc_type is None:
                raise AssertionError(f"Expected exception {self.expected_exception.__name__} was not raised.")
            return issubclass(exc_type, self.expected_exception)

    class PytestMock:
        @staticmethod
        def raises(expected_exception):
            return PytestRaisesContext(expected_exception)

    pytest = PytestMock()

from app.security.nonce import generate_nonce, NonceService
from app.security.replay import ReplayProtectionService, ReplayDetectedError



def test_nonce_generation():
    n1 = generate_nonce()
    n2 = generate_nonce()
    assert len(n1) == 32
    assert n1 != n2


def test_nonce_service_usage():
    service = NonceService(ttl=60)
    nonce = generate_nonce()

    assert service.register_nonce(nonce) is True
    assert service.register_nonce(nonce) is False  # Cannot register duplicate nonce
    assert service.validate_and_consume(nonce) is True
    assert service.validate_and_consume(nonce) is False  # Already consumed


def test_replay_protection_service():
    replay_svc = ReplayProtectionService(window=10)
    req_id = "req_txn_999"

    replay_svc.check_and_record(req_id)  # First request accepted

    with pytest.raises(ReplayDetectedError):
        replay_svc.check_and_record(req_id)  # Same request rejected as replay
