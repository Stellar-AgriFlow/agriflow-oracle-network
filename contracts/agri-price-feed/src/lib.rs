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
    PriceHistory(Symbol),
    ReporterPrice(Symbol, Address),
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
        env.storage()
            .instance()
            .set(&DataKey::BaseCurrency, &base_currency);
        let empty_reporters: Vec<Address> = Vec::new(&env);
        env.storage()
            .instance()
            .set(&DataKey::Reporters, &empty_reporters);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events()
            .publish((symbol_short!("init"), base_currency), admin);

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
        env.storage()
            .instance()
            .set(&DataKey::Reporters, &reporters);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

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
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish((symbol_short!("rep_rm"),), reporter);

        Ok(())
    }

    /// Slash and deactivate an oracle reporter node for malicious or outlier submissions
    pub fn slash_reporter(
        env: Env,
        reporter: Address,
        penalty_amount: i128,
    ) -> Result<(), OracleError> {
        Self::remove_reporter(env.clone(), reporter.clone())?;

        env.events()
            .publish((symbol_short!("slash"), reporter), penalty_amount);

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

        env.storage()
            .persistent()
            .set(&DataKey::Price(commodity.clone()), &data);
        env.storage().persistent().set(
            &DataKey::ReporterPrice(commodity.clone(), reporter.clone()),
            &data,
        );

        // Maintain historical price buffer for TWAP calculation
        let mut history: Vec<i128> = env
            .storage()
            .persistent()
            .get(&DataKey::PriceHistory(commodity.clone()))
            .unwrap_or(Vec::new(&env));
        if history.len() >= 5 {
            history.pop_front();
        }
        history.push_back(price);
        env.storage()
            .persistent()
            .set(&DataKey::PriceHistory(commodity.clone()), &history);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        env.storage().persistent().extend_ttl(
            &DataKey::Price(commodity.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );
        env.storage().persistent().extend_ttl(
            &DataKey::ReporterPrice(commodity.clone(), reporter.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );
        env.storage().persistent().extend_ttl(
            &DataKey::PriceHistory(commodity.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("price_upd"), commodity),
            (price, decimals, timestamp),
        );

        Ok(())
    }

    /// Retrieve the price submitted by a specific authorized reporter
    pub fn get_reporter_price(
        env: Env,
        commodity: Symbol,
        reporter: Address,
    ) -> Result<PriceData, OracleError> {
        env.storage()
            .persistent()
            .get(&DataKey::ReporterPrice(commodity, reporter))
            .ok_or(OracleError::FeedNotFound)
    }

    /// Calculate multi-reporter consensus median price across fresh reporting nodes
    pub fn get_median_price(
        env: Env,
        commodity: Symbol,
        max_staleness_seconds: u64,
    ) -> Result<i128, OracleError> {
        let reporters = Self::get_reporters(env.clone())?;
        let current_time = env.ledger().timestamp();
        let mut prices: Vec<i128> = Vec::new(&env);

        for r in reporters.iter() {
            if let Ok(data) = Self::get_reporter_price(env.clone(), commodity.clone(), r) {
                if current_time <= data.timestamp + max_staleness_seconds && data.price > 0 {
                    prices.push_back(data.price);
                }
            }
        }

        if prices.is_empty() {
            let global = Self::get_price_safe(env, commodity, max_staleness_seconds)?;
            return Ok(global.price);
        }

        let n = prices.len();
        let mut sorted = prices.clone();
        for i in 1..n {
            let mut j = i;
            while j > 0 && sorted.get(j).unwrap() < sorted.get(j - 1).unwrap() {
                let a = sorted.get(j).unwrap();
                let b = sorted.get(j - 1).unwrap();
                sorted.set(j, b);
                sorted.set(j - 1, a);
                j -= 1;
            }
        }

        let mid = n / 2;
        if n % 2 == 0 {
            let p1 = sorted.get(mid - 1).unwrap();
            let p2 = sorted.get(mid).unwrap();
            Ok((p1 + p2) / 2)
        } else {
            Ok(sorted.get(mid).unwrap())
        }
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

    /// Calculate Time-Weighted Average Price (TWAP) across recent price observations
    pub fn get_twap(env: Env, commodity: Symbol) -> Result<i128, OracleError> {
        let history: Vec<i128> = env
            .storage()
            .persistent()
            .get(&DataKey::PriceHistory(commodity))
            .ok_or(OracleError::FeedNotFound)?;

        if history.is_empty() {
            return Err(OracleError::FeedNotFound);
        }

        let mut sum: i128 = 0;
        let count = history.len();
        for p in history.iter() {
            sum += p;
        }

        Ok(sum / (count as i128))
    }

    /// Get list of authorized reporters
    pub fn get_reporters(env: Env) -> Result<Vec<Address>, OracleError> {
        env.storage()
            .instance()
            .get(&DataKey::Reporters)
            .ok_or(OracleError::NotInitialized)
    }

    /// Returns the total number of authorized price reporting nodes
    pub fn get_reporters_count(env: Env) -> u32 {
        let reporters: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Reporters)
            .unwrap_or(Vec::new(&env));
        reporters.len()
    }

    /// Verifies if a given address is an authorized reporter
    pub fn is_reporter(env: Env, reporter: Address) -> bool {
        let reporters: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Reporters)
            .unwrap_or(Vec::new(&env));
        for r in reporters.iter() {
            if r == reporter {
                return true;
            }
        }
        false
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
