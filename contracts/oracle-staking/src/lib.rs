#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum StakingError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InsufficientStake = 4,
    OperatorAlreadyRegistered = 5,
    OperatorNotFound = 6,
    OperatorInactive = 7,
    UnbondingNotReady = 8,
    NoUnbondingStake = 9,
    ContractPaused = 10,
    InvalidAmount = 11,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct OperatorInfo {
    pub operator: Address,
    pub staked_amount: i128,
    pub unbonding_amount: i128,
    pub unbond_release_ledger: u32,
    pub total_reports: u32,
    pub total_slashed: i128,
    pub total_rewards: i128,
    pub is_active: bool,
    pub registered_at_ledger: u32,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Paused,
    MinStake,
    UnbondingDelayLedgers,
    TotalStaked,
    OperatorsList,
    Operator(Address),
    StakeToken,
}

const INSTANCE_BUMP_AMOUNT: u32 = 300_000;
const INSTANCE_LIFETIME_THRESHOLD: u32 = 100_000;
const PERSISTENT_BUMP_AMOUNT: u32 = 300_000;
const PERSISTENT_LIFETIME_THRESHOLD: u32 = 100_000;

#[contract]
pub struct OracleStakingContract;

#[contractimpl]
impl OracleStakingContract {
    /// Initialize oracle staking protocol parameters
    pub fn initialize(
        env: Env,
        admin: Address,
        min_stake: i128,
        unbonding_delay_ledgers: u32,
    ) -> Result<(), StakingError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(StakingError::AlreadyInitialized);
        }

        admin.require_auth();

        if min_stake <= 0 {
            return Err(StakingError::InvalidAmount);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Paused, &false);
        env.storage().instance().set(&DataKey::MinStake, &min_stake);
        env.storage()
            .instance()
            .set(&DataKey::UnbondingDelayLedgers, &unbonding_delay_ledgers);
        env.storage().instance().set(&DataKey::TotalStaked, &0i128);

        let empty_list: Vec<Address> = Vec::new(&env);
        env.storage()
            .instance()
            .set(&DataKey::OperatorsList, &empty_list);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        Ok(())
    }

    /// Configure optional Stellar Asset Contract (SAC) or token address for real collateral transfers
    pub fn set_stake_token(env: Env, admin: Address, token: Address) -> Result<(), StakingError> {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(StakingError::NotInitialized)?;
        stored_admin.require_auth();
        if admin != stored_admin {
            return Err(StakingError::Unauthorized);
        }
        env.storage().instance().set(&DataKey::StakeToken, &token);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        Ok(())
    }

    pub fn get_stake_token(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::StakeToken)
    }

    /// Register a new oracle operator with initial staked collateral
    pub fn register_operator(
        env: Env,
        operator: Address,
        initial_stake: i128,
    ) -> Result<(), StakingError> {
        Self::ensure_not_paused(&env)?;
        operator.require_auth();

        let min_stake: i128 = env
            .storage()
            .instance()
            .get(&DataKey::MinStake)
            .ok_or(StakingError::NotInitialized)?;
        if initial_stake < min_stake {
            return Err(StakingError::InsufficientStake);
        }

        let op_key = DataKey::Operator(operator.clone());
        if env.storage().persistent().has(&op_key) {
            return Err(StakingError::OperatorAlreadyRegistered);
        }

        if let Some(token) = Self::get_stake_token(env.clone()) {
            soroban_sdk::token::Client::new(&env, &token).transfer(
                &operator,
                &env.current_contract_address(),
                &initial_stake,
            );
        }

        let current_ledger = env.ledger().sequence();
        let info = OperatorInfo {
            operator: operator.clone(),
            staked_amount: initial_stake,
            unbonding_amount: 0,
            unbond_release_ledger: 0,
            total_reports: 0,
            total_slashed: 0,
            total_rewards: 0,
            is_active: true,
            registered_at_ledger: current_ledger,
        };

        env.storage().persistent().set(&op_key, &info);
        env.storage().persistent().extend_ttl(
            &op_key,
            PERSISTENT_LIFETIME_THRESHOLD,
            PERSISTENT_BUMP_AMOUNT,
        );

        let mut list: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::OperatorsList)
            .unwrap_or(Vec::new(&env));
        list.push_back(operator.clone());
        env.storage().instance().set(&DataKey::OperatorsList, &list);

        let mut total_staked: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalStaked)
            .unwrap_or(0);
        total_staked += initial_stake;
        env.storage()
            .instance()
            .set(&DataKey::TotalStaked, &total_staked);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("stk_reg"), operator),
            (initial_stake, current_ledger),
        );

        Ok(())
    }

    /// Deposit additional stake into operator position
    pub fn deposit_stake(env: Env, operator: Address, amount: i128) -> Result<(), StakingError> {
        Self::ensure_not_paused(&env)?;
        operator.require_auth();

        if amount <= 0 {
            return Err(StakingError::InvalidAmount);
        }

        if let Some(token) = Self::get_stake_token(env.clone()) {
            soroban_sdk::token::Client::new(&env, &token).transfer(
                &operator,
                &env.current_contract_address(),
                &amount,
            );
        }

        let op_key = DataKey::Operator(operator.clone());
        let mut info: OperatorInfo = env
            .storage()
            .persistent()
            .get(&op_key)
            .ok_or(StakingError::OperatorNotFound)?;

        info.staked_amount += amount;
        info.is_active = true;

        env.storage().persistent().set(&op_key, &info);
        env.storage().persistent().extend_ttl(
            &op_key,
            PERSISTENT_LIFETIME_THRESHOLD,
            PERSISTENT_BUMP_AMOUNT,
        );

        let mut total_staked: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalStaked)
            .unwrap_or(0);
        total_staked += amount;
        env.storage()
            .instance()
            .set(&DataKey::TotalStaked, &total_staked);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("stk_dep"), operator),
            (amount, info.staked_amount),
        );

        Ok(())
    }

    /// Request to unbond a portion of staked capital
    pub fn request_unbond(env: Env, operator: Address, amount: i128) -> Result<(), StakingError> {
        Self::ensure_not_paused(&env)?;
        operator.require_auth();

        if amount <= 0 {
            return Err(StakingError::InvalidAmount);
        }

        let op_key = DataKey::Operator(operator.clone());
        let mut info: OperatorInfo = env
            .storage()
            .persistent()
            .get(&op_key)
            .ok_or(StakingError::OperatorNotFound)?;

        if info.staked_amount < amount {
            return Err(StakingError::InsufficientStake);
        }

        let delay: u32 = env
            .storage()
            .instance()
            .get(&DataKey::UnbondingDelayLedgers)
            .unwrap_or(17280);
        let current_ledger = env.ledger().sequence();
        let release_ledger = current_ledger + delay;

        info.staked_amount -= amount;
        info.unbonding_amount += amount;
        info.unbond_release_ledger = release_ledger;

        let min_stake: i128 = env
            .storage()
            .instance()
            .get(&DataKey::MinStake)
            .unwrap_or(0);
        if info.staked_amount < min_stake {
            info.is_active = false;
        }

        env.storage().persistent().set(&op_key, &info);
        env.storage().persistent().extend_ttl(
            &op_key,
            PERSISTENT_LIFETIME_THRESHOLD,
            PERSISTENT_BUMP_AMOUNT,
        );

        let mut total_staked: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalStaked)
            .unwrap_or(0);
        total_staked -= amount;
        env.storage()
            .instance()
            .set(&DataKey::TotalStaked, &total_staked);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("unb_req"), operator),
            (amount, release_ledger),
        );

        Ok(())
    }

    /// Withdraw matured unbonded stake
    pub fn withdraw_unbonded(env: Env, operator: Address) -> Result<i128, StakingError> {
        Self::ensure_not_paused(&env)?;
        operator.require_auth();

        let op_key = DataKey::Operator(operator.clone());
        let mut info: OperatorInfo = env
            .storage()
            .persistent()
            .get(&op_key)
            .ok_or(StakingError::OperatorNotFound)?;

        if info.unbonding_amount <= 0 {
            return Err(StakingError::NoUnbondingStake);
        }

        let current_ledger = env.ledger().sequence();
        if current_ledger < info.unbond_release_ledger {
            return Err(StakingError::UnbondingNotReady);
        }

        let withdrawn = info.unbonding_amount;
        info.unbonding_amount = 0;
        info.unbond_release_ledger = 0;

        if let Some(token) = Self::get_stake_token(env.clone()) {
            soroban_sdk::token::Client::new(&env, &token).transfer(
                &env.current_contract_address(),
                &operator,
                &withdrawn,
            );
        }

        env.storage().persistent().set(&op_key, &info);
        env.storage().persistent().extend_ttl(
            &op_key,
            PERSISTENT_LIFETIME_THRESHOLD,
            PERSISTENT_BUMP_AMOUNT,
        );

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("unb_wdr"), operator),
            (withdrawn, current_ledger),
        );

        Ok(withdrawn)
    }

    /// Slash operator for deviant/malicious reporting
    pub fn slash_operator(
        env: Env,
        operator: Address,
        slash_amount: i128,
        reason: Symbol,
    ) -> Result<i128, StakingError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(StakingError::NotInitialized)?;
        admin.require_auth();

        if slash_amount <= 0 {
            return Err(StakingError::InvalidAmount);
        }

        let op_key = DataKey::Operator(operator.clone());
        let mut info: OperatorInfo = env
            .storage()
            .persistent()
            .get(&op_key)
            .ok_or(StakingError::OperatorNotFound)?;

        let actual_slash = if info.staked_amount < slash_amount {
            info.staked_amount
        } else {
            slash_amount
        };

        info.staked_amount -= actual_slash;
        info.total_slashed += actual_slash;

        let min_stake: i128 = env
            .storage()
            .instance()
            .get(&DataKey::MinStake)
            .unwrap_or(0);
        if info.staked_amount < min_stake {
            info.is_active = false;
        }

        env.storage().persistent().set(&op_key, &info);
        env.storage().persistent().extend_ttl(
            &op_key,
            PERSISTENT_LIFETIME_THRESHOLD,
            PERSISTENT_BUMP_AMOUNT,
        );

        let mut total_staked: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalStaked)
            .unwrap_or(0);
        total_staked -= actual_slash;
        env.storage()
            .instance()
            .set(&DataKey::TotalStaked, &total_staked);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        if let Some(token) = Self::get_stake_token(env.clone()) {
            soroban_sdk::token::Client::new(&env, &token).transfer(
                &env.current_contract_address(),
                &admin,
                &actual_slash,
            );
        }

        env.events()
            .publish((symbol_short!("stk_slh"), operator), (actual_slash, reason));

        Ok(actual_slash)
    }

    /// Reward operator for verified, timely report
    pub fn reward_operator(
        env: Env,
        operator: Address,
        reward_amount: i128,
    ) -> Result<(), StakingError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(StakingError::NotInitialized)?;
        admin.require_auth();

        if reward_amount <= 0 {
            return Err(StakingError::InvalidAmount);
        }

        let op_key = DataKey::Operator(operator.clone());
        let mut info: OperatorInfo = env
            .storage()
            .persistent()
            .get(&op_key)
            .ok_or(StakingError::OperatorNotFound)?;

        info.staked_amount += reward_amount;
        info.total_rewards += reward_amount;
        info.total_reports += 1;

        env.storage().persistent().set(&op_key, &info);
        env.storage().persistent().extend_ttl(
            &op_key,
            PERSISTENT_LIFETIME_THRESHOLD,
            PERSISTENT_BUMP_AMOUNT,
        );

        let mut total_staked: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalStaked)
            .unwrap_or(0);
        total_staked += reward_amount;
        env.storage()
            .instance()
            .set(&DataKey::TotalStaked, &total_staked);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("stk_rwd"), operator),
            (reward_amount, info.staked_amount),
        );

        Ok(())
    }

    /// Record a verified report to operator statistics
    pub fn record_report(env: Env, operator: Address) -> Result<(), StakingError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(StakingError::NotInitialized)?;
        admin.require_auth();

        let op_key = DataKey::Operator(operator);
        let mut info: OperatorInfo = env
            .storage()
            .persistent()
            .get(&op_key)
            .ok_or(StakingError::OperatorNotFound)?;

        info.total_reports += 1;
        env.storage().persistent().set(&op_key, &info);
        Ok(())
    }

    /// Get operator info
    pub fn get_operator(env: Env, operator: Address) -> Option<OperatorInfo> {
        env.storage().persistent().get(&DataKey::Operator(operator))
    }

    /// Get list of all registered operator addresses
    pub fn get_operators(env: Env) -> Vec<Address> {
        env.storage()
            .instance()
            .get(&DataKey::OperatorsList)
            .unwrap_or(Vec::new(&env))
    }

    /// Get total staked protocol collateral
    pub fn get_total_staked(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalStaked)
            .unwrap_or(0)
    }

    /// Check if operator has active status and meets minimum stake
    pub fn is_operator_eligible(env: Env, operator: Address) -> bool {
        if let Some(info) = Self::get_operator(env.clone(), operator) {
            let min_stake: i128 = env
                .storage()
                .instance()
                .get(&DataKey::MinStake)
                .unwrap_or(0);
            info.is_active && info.staked_amount >= min_stake
        } else {
            false
        }
    }

    /// Pause contract
    pub fn pause(env: Env) -> Result<(), StakingError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(StakingError::NotInitialized)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::Paused, &true);
        Ok(())
    }

    /// Unpause contract
    pub fn unpause(env: Env) -> Result<(), StakingError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(StakingError::NotInitialized)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::Paused, &false);
        Ok(())
    }

    fn ensure_not_paused(env: &Env) -> Result<(), StakingError> {
        let paused: bool = env
            .storage()
            .instance()
            .get(&DataKey::Paused)
            .unwrap_or(false);
        if paused {
            return Err(StakingError::ContractPaused);
        }
        Ok(())
    }
}

#[cfg(test)]
mod test;
