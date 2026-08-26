from app.attacks.impersonation import ImpersonationAttack


def test_impersonation_attack_simulation_blocked():
    attack = ImpersonationAttack(target="local_qshield")
    result = attack.run_simulation(user_id="fake_user_123")

    assert result.blocked is True
    assert result.detected is True
    assert result.success is False
