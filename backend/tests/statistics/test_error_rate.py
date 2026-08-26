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

from app.statistics.error_rate import calculate_error_rate, calculate_aggregated_error_rate, InvalidErrorRateInputError



def test_calculate_error_rate_valid():
    res = calculate_error_rate(10, 100)
    assert res.errors == 10
    assert res.observations == 100
    assert res.rate == 0.10
    assert res.percentage == 10.0


def test_calculate_error_rate_zero_errors():
    res = calculate_error_rate(0, 50)
    assert res.rate == 0.0
    assert res.percentage == 0.0


def test_calculate_error_rate_invalid_inputs():
    with pytest.raises(InvalidErrorRateInputError):
        calculate_error_rate(10, 0)

    with pytest.raises(InvalidErrorRateInputError):
        calculate_error_rate(-5, 100)

    with pytest.raises(InvalidErrorRateInputError):
        calculate_error_rate(150, 100)


def test_aggregated_error_rate():
    groups = [(10, 100), (5, 50)]
    res = calculate_aggregated_error_rate(groups)
    assert res.errors == 15
    assert res.observations == 150
    assert res.rate == 0.10
