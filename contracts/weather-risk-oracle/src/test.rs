#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, symbol_short, Address, Env};

#[test]
fn test_weather_oracle_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(WeatherRiskOracleContract, ());
    let client = WeatherRiskOracleContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reporter = Address::generate(&env);

    // 1. Initialize
    client.initialize(&admin);
    assert_eq!(client.get_admin(), admin);

    // 2. Add Reporter
    client.add_reporter(&reporter);
    assert_eq!(client.get_reporters().len(), 1);

    // 3. Report Weather: Region NG_KANO (Rainfall 12mm vs 120mm avg, Drought index 88, Heat warning true)
    let region = symbol_short!("NG_KANO");
    env.ledger().set_timestamp(1_700_000_100);
    client.report_weather(&reporter, &region, &12, &120, &88, &true);

    // 4. Query Metrics
    let metrics = client.get_metrics(&region);
    assert_eq!(metrics.rainfall_mm, 12);
    assert_eq!(metrics.historical_avg_rainfall_mm, 120);
    assert_eq!(metrics.drought_index, 88);
    assert_eq!(metrics.extreme_temp_flag, true);
    assert_eq!(metrics.timestamp, 1_700_000_100);

    // 5. Test Drought Trigger
    let is_triggered_at_80 = client.check_drought_trigger(&region, &80);
    assert_eq!(is_triggered_at_80, true);

    let is_triggered_at_90 = client.check_drought_trigger(&region, &90);
    assert_eq!(is_triggered_at_90, false);
}

#[test]
fn test_invalid_drought_index_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(WeatherRiskOracleContract, ());
    let client = WeatherRiskOracleContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reporter = Address::generate(&env);

    client.initialize(&admin);
    client.add_reporter(&reporter);

    // Drought index > 100 is invalid
    let res = client.try_report_weather(&reporter, &symbol_short!("KE_RIFT"), &50, &100, &105, &false);
    assert_eq!(res.err(), Some(Ok(WeatherOracleError::InvalidMetrics)));
}

#[test]
fn test_flood_trigger() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(WeatherRiskOracleContract, ());
    let client = WeatherRiskOracleContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reporter = Address::generate(&env);

    client.initialize(&admin);
    client.add_reporter(&reporter);

    let region = symbol_short!("IN_PUNJ");
    // Report 250mm torrential rainfall vs 80mm historical average
    client.report_weather(&reporter, &region, &250, &80, &5, &false);

    assert_eq!(client.check_flood_trigger(&region, &200), true);
    assert_eq!(client.check_flood_trigger(&region, &300), false);
}

