from app.attacks.unauthorized_verification import UnauthorizedVerificationAttack


def test_unauthorized_verification_attack_blocked():
    attack = UnauthorizedVerificationAttack(target="local_qshield")
    result = attack.run_simulation(unauthorized_user_id="guest_999")

    assert result.blocked is True
    assert result.detected is True
    assert result.success is False
