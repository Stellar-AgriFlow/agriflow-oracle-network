#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum OracleError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidPrice = 4,
    FeedNotFound = 5,
    PriceStale = 6,
    ReporterAlreadyExists = 7,
    ReporterNotFound = 8,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PriceData {
    pub price: i128,
    pub decimals: u32,
    pub confidence: u32,
    pub timestamp: u64,
    pub reporter: Address,
}

#[contracttype]
pub enum DataKey {
    Admin,
    BaseCurrency,
    Reporters,
    Price(Symbol),
}

const INSTANCE_BUMP_AMOUNT: u32 = 300_000;
const INSTANCE_LIFETIME_THRESHOLD: u32 = 100_000;

#[contract]
pub struct AgriPriceFeedContract;

#[contractimpl]
impl AgriPriceFeedContract {
    /// Initialize the oracle price feed with an administrator and default base currency (e.g. USD)
    pub fn initialize(env: Env, admin: Address, base_currency: Symbol) -> Result<(), OracleError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(OracleError::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::BaseCurrency, &base_currency);
        let empty_reporters: Vec<Address> = Vec::new(&env);
        env.storage().instance().set(&DataKey::Reporters, &empty_reporters);

        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("init"), base_currency),
            admin,
        );

        Ok(())
    }

    /// Add an authorized oracle reporter node
    pub fn add_reporter(env: Env, reporter: Address) -> Result<(), OracleError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(OracleError::NotInitialized)?;

        admin.require_auth();

        let mut reporters: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Reporters)
            .unwrap_or(Vec::new(&env));

        for existing in reporters.iter() {
            if existing == reporter {
                return Err(OracleError::ReporterAlreadyExists);
            }
        }

        reporters.push_back(reporter.clone());
        env.storage().instance().set(&DataKey::Reporters, &reporters);
        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish((symbol_short!("rep_add"),), reporter);

        Ok(())
    }

    /// Remove an authorized oracle reporter node
    pub fn remove_reporter(env: Env, reporter: Address) -> Result<(), OracleError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(OracleError::NotInitialized)?;

        admin.require_auth();

        let reporters: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Reporters)
            .unwrap_or(Vec::new(&env));

        let mut updated: Vec<Address> = Vec::new(&env);
        let mut found = false;

        for r in reporters.iter() {
            if r == reporter {
                found = true;
            } else {
                updated.push_back(r);
            }
        }

        if !found {
            return Err(OracleError::ReporterNotFound);
        }

        env.storage().instance().set(&DataKey::Reporters, &updated);
        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish((symbol_short!("rep_rm"),), reporter);

        Ok(())
    }

    /// Submit a verified agricultural commodity price update
    pub fn set_price(
        env: Env,
        reporter: Address,
        commodity: Symbol,
        price: i128,
        decimals: u32,
        confidence: u32,
    ) -> Result<(), OracleError> {
        reporter.require_auth();

        if price <= 0 {
            return Err(OracleError::InvalidPrice);
        }

        let reporters: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Reporters)
            .ok_or(OracleError::NotInitialized)?;

        let mut is_authorized = false;
        for r in reporters.iter() {
            if r == reporter {
                is_authorized = true;
                break;
            }
        }

        if !is_authorized {
            return Err(OracleError::Unauthorized);
        }

        let timestamp = env.ledger().timestamp();

        let data = PriceData {
            price,
            decimals,
            confidence,
            timestamp,
            reporter: reporter.clone(),
        };

        env.storage().persistent().set(&DataKey::Price(commodity.clone()), &data);
        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("price_upd"), commodity),
            (price, decimals, timestamp),
        );

        Ok(())
    }

    /// Retrieve the latest recorded price data for an agricultural commodity
    pub fn get_price(env: Env, commodity: Symbol) -> Result<PriceData, OracleError> {
        env.storage()
            .persistent()
            .get(&DataKey::Price(commodity))
            .ok_or(OracleError::FeedNotFound)
    }

    /// Retrieve the latest price and verify it does not exceed the allowed staleness threshold
    pub fn get_price_safe(
        env: Env,
        commodity: Symbol,
        max_staleness_seconds: u64,
    ) -> Result<PriceData, OracleError> {
        let data = Self::get_price(env.clone(), commodity)?;
        let current_time = env.ledger().timestamp();

        if current_time > data.timestamp + max_staleness_seconds {
            return Err(OracleError::PriceStale);
        }

        Ok(data)
    }

    /// Get list of authorized reporters
    pub fn get_reporters(env: Env) -> Result<Vec<Address>, OracleError> {
        env.storage()
            .instance()
            .get(&DataKey::Reporters)
            .ok_or(OracleError::NotInitialized)
    }

    /// Get oracle administrator address
    pub fn get_admin(env: Env) -> Result<Address, OracleError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(OracleError::NotInitialized)
    }
}

#[cfg(test)]
mod test;

