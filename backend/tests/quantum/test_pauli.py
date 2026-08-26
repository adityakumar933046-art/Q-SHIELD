import numpy as np
from app.quantum.states import state_0, state_1
from app.quantum.pauli import apply_pauli, get_pauli_matrix


def test_pauli_matrices():
    I = get_pauli_matrix("I")
    X = get_pauli_matrix("X")
    Y = get_pauli_matrix("Y")
    Z = get_pauli_matrix("Z")

    assert I.shape == (2, 2)
    assert X.shape == (2, 2)
    assert Y.shape == (2, 2)
    assert Z.shape == (2, 2)


def test_pauli_operations():
    # X|0> = |1>
    s0 = state_0()
    s1 = apply_pauli("X", s0)
    assert np.allclose(s1.to_vector(), [0, 1])

    # X|1> = |0>
    s0_ret = apply_pauli("X", s1)
    assert np.allclose(s0_ret.to_vector(), [1, 0])

    # Z|0> = |0>
    sz0 = apply_pauli("Z", s0)
    assert np.allclose(sz0.to_vector(), [1, 0])

    # Z|1> = -|1>
    sz1 = apply_pauli("Z", s1)
    assert np.allclose(sz1.to_vector(), [0, -1])

    # Y|0> = i|1>
    sy0 = apply_pauli("Y", s0)
    assert np.allclose(sy0.to_vector(), [0, 1j])
