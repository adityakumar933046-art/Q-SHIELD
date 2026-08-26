from app.security.threat_engine import ThreatEngine, ThreatSignal, Severity


def test_threat_engine_no_signals():
    assessment = ThreatEngine.evaluate([])
    assert assessment.detected is False
    assert assessment.severity == Severity.LOW
    assert assessment.score == 0.0


def test_threat_engine_single_signal():
    assessment = ThreatEngine.evaluate([ThreatSignal.AUTH_FAILURE])
    assert assessment.detected is True
    assert assessment.severity == Severity.LOW
    assert assessment.score == 15.0


def test_threat_engine_replay_threat():
    assessment = ThreatEngine.evaluate([ThreatSignal.REPLAY_ATTEMPT])
    assert assessment.detected is True
    assert assessment.severity == Severity.CRITICAL
    assert assessment.score == 50.0
