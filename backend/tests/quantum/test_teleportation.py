from app.quantum.states import state_0, state_1, state_plus, state_minus
from app.quantum.teleportation import TeleportationService


def test_teleportation_state_0():
    s0 = state_0()
    res = TeleportationService.teleport(s0, seed=42)
    assert res.success is True
    assert res.fidelity >= 0.99


def test_teleportation_state_1():
    s1 = state_1()
    res = TeleportationService.teleport(s1, seed=123)
    assert res.success is True
    assert res.fidelity >= 0.99


def test_teleportation_state_plus():
    sp = state_plus()
    res = TeleportationService.teleport(sp, seed=999)
    assert res.success is True
    assert res.fidelity >= 0.99
