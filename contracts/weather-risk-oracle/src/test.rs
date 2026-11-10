#![cfg(test)]
use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Ledger},
    Address, Env,
};

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
    assert!(metrics.extreme_temp_flag);
    assert_eq!(metrics.timestamp, 1_700_000_100);

    // 5. Test Drought Trigger
    let is_triggered_at_80 = client.check_drought_trigger(&region, &80);
    assert!(is_triggered_at_80);

    let is_triggered_at_90 = client.check_drought_trigger(&region, &90);
    assert!(!is_triggered_at_90);
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
    let res = client.try_report_weather(
        &reporter,
        &symbol_short!("KE_RIFT"),
        &50,
        &100,
        &105,
        &false,
    );
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

    assert!(client.check_flood_trigger(&region, &200));
    assert!(!client.check_flood_trigger(&region, &300));
}

#[test]
fn test_rainfall_baseline_deviation() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(WeatherRiskOracleContract, ());
    let client = WeatherRiskOracleContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reporter = Address::generate(&env);

    client.initialize(&admin);
    client.add_reporter(&reporter);

    let region = symbol_short!("KE_NAK");

    // Deficit: 30mm rainfall vs 100mm historical average -> -70mm
    client.report_weather(&reporter, &region, &30, &100, &70, &false);
    assert_eq!(client.get_deviation_from_baseline(&region), -70);

    // Excess: 140mm rainfall vs 100mm historical average -> +40mm
    client.report_weather(&reporter, &region, &140, &100, &10, &false);
    assert_eq!(client.get_deviation_from_baseline(&region), 40);
}

#[test]
fn test_weather_reporter_quorum() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(WeatherRiskOracleContract, ());
    let client = WeatherRiskOracleContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let r1 = Address::generate(&env);
    let r2 = Address::generate(&env);
    let unknown = Address::generate(&env);

    client.initialize(&admin);
    assert_eq!(client.get_reporters_count(), 0);

    client.add_reporter(&r1);
    client.add_reporter(&r2);

    assert_eq!(client.get_reporters_count(), 2);
    assert!(client.is_reporter(&r1));
    assert!(client.is_reporter(&r2));
    assert!(!client.is_reporter(&unknown));
}

#[test]
fn test_update_baseline_rainfall() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(WeatherRiskOracleContract, ());
    let client = WeatherRiskOracleContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reporter = Address::generate(&env);
    let region = symbol_short!("NG_KANO");

    client.initialize(&admin);
    client.add_reporter(&reporter);

    client.report_weather(&reporter, &region, &40, &100, &60, &false);
    assert_eq!(client.get_deviation_from_baseline(&region), -60);

    // Admin updates baseline from 100mm to 120mm
    client.update_baseline_rainfall(&region, &120);
    assert_eq!(client.get_deviation_from_baseline(&region), -80);
}

#[test]
fn test_weather_freshness_and_staleness() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(WeatherRiskOracleContract, ());
    let client = WeatherRiskOracleContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reporter = Address::generate(&env);
    let region = symbol_short!("NG_KANO");

    client.initialize(&admin);
    client.add_reporter(&reporter);

    env.ledger().set_timestamp(1_000_000);
    client.report_weather(&reporter, &region, &40, &100, &60, &false);

    assert!(client.is_fresh(&region, &3600));
    assert_eq!(client.get_metrics_safe(&region, &3600).rainfall_mm, 40);

    // Fast-forward 4000s > 3600s
    env.ledger().set_timestamp(1_004_000);
    assert!(!client.is_fresh(&region, &3600));
    let err = client.try_get_metrics_safe(&region, &3600);
    assert_eq!(err.err(), Some(Ok(WeatherOracleError::MetricsStale)));
}
