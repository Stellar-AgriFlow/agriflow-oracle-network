#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, symbol_short, Address, Env};

#[test]
fn test_price_feed_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AgriPriceFeedContract, ());
    let client = AgriPriceFeedContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reporter = Address::generate(&env);
    let base_currency = symbol_short!("USD");

    // 1. Initialize
    client.initialize(&admin, &base_currency);
    assert_eq!(client.get_admin(), admin);

    // 2. Add Reporter
    client.add_reporter(&reporter);
    let reporters = client.get_reporters();
    assert_eq!(reporters.len(), 1);
    assert_eq!(reporters.get(0).unwrap(), reporter);

    // 3. Set Price (Maize at $4.50 with 2 decimals = 450)
    let maize = symbol_short!("MAIZE");
    env.ledger().set_timestamp(1_700_000_000);
    client.set_price(&reporter, &maize, &450, &2, &95);

    // 4. Query Price
    let data = client.get_price(&maize);
    assert_eq!(data.price, 450);
    assert_eq!(data.decimals, 2);
    assert_eq!(data.confidence, 95);
    assert_eq!(data.timestamp, 1_700_000_000);
    assert_eq!(data.reporter, reporter);

    // 5. Query Price Safe within staleness
    let safe_data = client.get_price_safe(&maize, &3600);
    assert_eq!(safe_data.price, 450);

    // 6. Test Staleness Exceeded
    env.ledger().set_timestamp(1_700_000_000 + 4000);
    let stale_res = client.try_get_price_safe(&maize, &3600);
    assert_eq!(stale_res.err(), Some(Ok(OracleError::PriceStale)));
}

#[test]
fn test_unauthorized_reporter_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AgriPriceFeedContract, ());
    let client = AgriPriceFeedContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let unauth_reporter = Address::generate(&env);

    client.initialize(&admin, &symbol_short!("USD"));

    let res = client.try_set_price(&unauth_reporter, &symbol_short!("WHEAT"), &600, &2, &90);
    assert_eq!(res.err(), Some(Ok(OracleError::Unauthorized)));
}

#[test]
fn test_remove_reporter() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AgriPriceFeedContract, ());
    let client = AgriPriceFeedContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reporter = Address::generate(&env);

    client.initialize(&admin, &symbol_short!("USD"));
    client.add_reporter(&reporter);
    assert_eq!(client.get_reporters().len(), 1);

    client.remove_reporter(&reporter);
    assert_eq!(client.get_reporters().len(), 0);

    // Now reporter should fail to set price
    let res = client.try_set_price(&reporter, &symbol_short!("COCOA"), &3000, &2, &90);
    assert_eq!(res.err(), Some(Ok(OracleError::Unauthorized)));
}

#[test]
fn test_twap_calculation() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AgriPriceFeedContract, ());
    let client = AgriPriceFeedContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reporter = Address::generate(&env);

    client.initialize(&admin, &symbol_short!("USD"));
    client.add_reporter(&reporter);

    let wheat = symbol_short!("WHEAT");

    // Report prices: 500, 520, 540 -> Average = 520
    client.set_price(&reporter, &wheat, &500, &2, &95);
    client.set_price(&reporter, &wheat, &520, &2, &95);
    client.set_price(&reporter, &wheat, &540, &2, &95);

    let twap = client.get_twap(&wheat);
    assert_eq!(twap, 520);
}

#[test]
fn test_reporter_quorum_and_verification() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AgriPriceFeedContract, ());
    let client = AgriPriceFeedContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reporter1 = Address::generate(&env);
    let reporter2 = Address::generate(&env);
    let outsider = Address::generate(&env);

    client.initialize(&admin, &symbol_short!("USD"));
    assert_eq!(client.get_reporters_count(), 0);

    client.add_reporter(&reporter1);
    client.add_reporter(&reporter2);

    assert_eq!(client.get_reporters_count(), 2);
    assert!(client.is_reporter(&reporter1));
    assert!(client.is_reporter(&reporter2));
    assert!(!client.is_reporter(&outsider));
}

#[test]
fn test_reporter_slashing() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AgriPriceFeedContract, ());
    let client = AgriPriceFeedContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let reporter = Address::generate(&env);

    client.initialize(&admin, &symbol_short!("USD"));
    client.add_reporter(&reporter);
    assert_eq!(client.get_reporters_count(), 1);

    client.slash_reporter(&reporter, &5000i128);
    assert_eq!(client.get_reporters_count(), 0);
    assert!(!client.is_reporter(&reporter));
}

