#![cfg(test)]
use super::*;
use soroban_sdk::{
    symbol_short,
    testutils::{Address as _, Ledger},
    Address, Env,
};

#[test]
fn test_staking_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(OracleStakingContract, ());
    let client = OracleStakingContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let operator = Address::generate(&env);

    // 1. Initialize
    client.initialize(&admin, &5_000, &100);
    assert_eq!(client.get_total_staked(), 0);

    // 2. Register operator with 10,000 stake (exceeds 5,000 min)
    client.register_operator(&operator, &10_000);
    assert_eq!(client.get_total_staked(), 10_000);
    assert_eq!(client.is_operator_eligible(&operator), true);

    let info = client.get_operator(&operator).unwrap();
    assert_eq!(info.staked_amount, 10_000);
    assert_eq!(info.is_active, true);

    // 3. Deposit additional stake
    client.deposit_stake(&operator, &5_000);
    assert_eq!(client.get_total_staked(), 15_000);

    let updated_info = client.get_operator(&operator).unwrap();
    assert_eq!(updated_info.staked_amount, 15_000);
}

#[test]
fn test_unbonding_workflow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(OracleStakingContract, ());
    let client = OracleStakingContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let operator = Address::generate(&env);

    client.initialize(&admin, &5_000, &50); // 50 ledgers delay
    client.register_operator(&operator, &10_000);

    // Request unbond 4,000
    env.ledger().set_sequence_number(100);
    client.request_unbond(&operator, &4_000);

    let info = client.get_operator(&operator).unwrap();
    assert_eq!(info.staked_amount, 6_000);
    assert_eq!(info.unbonding_amount, 4_000);
    assert_eq!(info.unbond_release_ledger, 150); // 100 + 50
    assert_eq!(client.get_total_staked(), 6_000);

    // Try withdraw before delay (at ledger 120 < 150)
    env.ledger().set_sequence_number(120);
    let err = client.try_withdraw_unbonded(&operator);
    assert_eq!(err.err(), Some(Ok(StakingError::UnbondingNotReady)));

    // Withdraw at ledger 150
    env.ledger().set_sequence_number(150);
    let withdrawn = client.withdraw_unbonded(&operator);
    assert_eq!(withdrawn, 4_000);

    let post_info = client.get_operator(&operator).unwrap();
    assert_eq!(post_info.unbonding_amount, 0);
}

#[test]
fn test_slashing_and_deactivation() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(OracleStakingContract, ());
    let client = OracleStakingContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let operator = Address::generate(&env);

    client.initialize(&admin, &5_000, &100);
    client.register_operator(&operator, &6_000);

    // Slash 2,000 for deviant price report
    let slashed = client.slash_operator(&operator, &2_000, &symbol_short!("dev_rep"));
    assert_eq!(slashed, 2_000);

    let info = client.get_operator(&operator).unwrap();
    assert_eq!(info.staked_amount, 4_000);
    assert_eq!(info.total_slashed, 2_000);
    // 4,000 < 5,000 min_stake -> operator becomes inactive!
    assert_eq!(info.is_active, false);
    assert_eq!(client.is_operator_eligible(&operator), false);
    assert_eq!(client.get_total_staked(), 4_000);
}

#[test]
fn test_rewarding_and_reporting() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(OracleStakingContract, ());
    let client = OracleStakingContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let operator = Address::generate(&env);

    client.initialize(&admin, &5_000, &100);
    client.register_operator(&operator, &8_000);

    // Record verified report
    client.record_report(&operator);
    let info1 = client.get_operator(&operator).unwrap();
    assert_eq!(info1.total_reports, 1);

    // Reward 500 tokens
    client.reward_operator(&operator, &500);
    let info2 = client.get_operator(&operator).unwrap();
    assert_eq!(info2.staked_amount, 8_500);
    assert_eq!(info2.total_rewards, 500);
    assert_eq!(info2.total_reports, 2);
    assert_eq!(client.get_total_staked(), 8_500);
}

#[test]
fn test_pause_circuit_breaker() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(OracleStakingContract, ());
    let client = OracleStakingContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let operator = Address::generate(&env);

    client.initialize(&admin, &5_000, &100);
    client.pause();

    let res = client.try_register_operator(&operator, &10_000);
    assert_eq!(res.err(), Some(Ok(StakingError::ContractPaused)));

    client.unpause();
    client.register_operator(&operator, &10_000);
    assert_eq!(client.is_operator_eligible(&operator), true);
}

#[test]
fn test_staking_token_transfers() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(OracleStakingContract, ());
    let client = OracleStakingContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let operator = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_client = soroban_sdk::token::Client::new(&env, &token_contract.address());
    let token_admin_client =
        soroban_sdk::token::StellarAssetClient::new(&env, &token_contract.address());

    token_admin_client.mint(&operator, &50_000);
    assert_eq!(token_client.balance(&operator), 50_000);

    client.initialize(&admin, &5_000, &50);
    client.set_stake_token(&admin, &token_contract.address());

    // Register operator with token transfer
    client.register_operator(&operator, &10_000);
    assert_eq!(token_client.balance(&operator), 40_000);
    assert_eq!(token_client.balance(&contract_id), 10_000);

    let info = client.get_operator(&operator).unwrap();
    assert_eq!(info.is_token_staked, true);

    // Unbond and withdraw
    env.ledger().set_sequence_number(100);
    client.request_unbond(&operator, &5_000);
    env.ledger().set_sequence_number(160);
    client.withdraw_unbonded(&operator);

    assert_eq!(token_client.balance(&operator), 45_000);
    assert_eq!(token_client.balance(&contract_id), 5_000);
}
