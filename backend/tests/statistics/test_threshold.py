from app.statistics.threshold import evaluate_threshold


def test_evaluate_threshold_passed():
    res = evaluate_threshold("error_rate", 0.02, threshold=0.05, comparison="<=")
    assert res.passed is True
    assert "PASSED" in res.reason


def test_evaluate_threshold_failed():
    res = evaluate_threshold("error_rate", 0.08, threshold=0.05, comparison="<=")
    assert res.passed is False
    assert "FAILED" in res.reason
