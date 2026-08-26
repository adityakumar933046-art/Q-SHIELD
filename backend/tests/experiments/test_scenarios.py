from app.experiments.scenarios import ScenarioRegistry, BASELINE_SCENARIOS


def test_scenario_registry_list_and_get():
    scenarios = ScenarioRegistry.list_scenarios()
    assert len(scenarios) >= 9

    s = ScenarioRegistry.get_scenario("LEGITIMATE_VERIFICATION")
    assert s.scenario_id == "LEGITIMATE_VERIFICATION"
    assert s.scenario_version == "1.0"
