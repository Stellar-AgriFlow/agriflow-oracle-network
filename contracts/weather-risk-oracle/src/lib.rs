#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum WeatherOracleError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidMetrics = 4,
    RegionNotFound = 5,
    MetricsStale = 6,
    ReporterAlreadyExists = 7,
    ReporterNotFound = 8,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WeatherMetrics {
    pub rainfall_mm: u32,
    pub historical_avg_rainfall_mm: u32,
    pub drought_index: u32, // 0 to 100
    pub extreme_temp_flag: bool,
    pub timestamp: u64,
    pub reporter: Address,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Reporters,
    Metrics(Symbol),
}

const INSTANCE_BUMP_AMOUNT: u32 = 300_000;
const INSTANCE_LIFETIME_THRESHOLD: u32 = 100_000;

#[contract]
pub struct WeatherRiskOracleContract;

#[contractimpl]
impl WeatherRiskOracleContract {
    /// Initialize the weather risk oracle
    pub fn initialize(env: Env, admin: Address) -> Result<(), WeatherOracleError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(WeatherOracleError::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        let empty_reporters: Vec<Address> = Vec::new(&env);
        env.storage().instance().set(&DataKey::Reporters, &empty_reporters);

        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish((symbol_short!("w_init"),), admin);

        Ok(())
    }

    /// Add an authorized weather data reporter
    pub fn add_reporter(env: Env, reporter: Address) -> Result<(), WeatherOracleError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(WeatherOracleError::NotInitialized)?;

        admin.require_auth();

        let mut reporters: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Reporters)
            .unwrap_or(Vec::new(&env));

        for existing in reporters.iter() {
            if existing == reporter {
                return Err(WeatherOracleError::ReporterAlreadyExists);
            }
        }

        reporters.push_back(reporter.clone());
        env.storage().instance().set(&DataKey::Reporters, &reporters);
        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish((symbol_short!("w_rep_add"),), reporter);

        Ok(())
    }

    /// Remove an authorized weather data reporter
    pub fn remove_reporter(env: Env, reporter: Address) -> Result<(), WeatherOracleError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(WeatherOracleError::NotInitialized)?;

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
            return Err(WeatherOracleError::ReporterNotFound);
        }

        env.storage().instance().set(&DataKey::Reporters, &updated);
        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish((symbol_short!("w_rep_rm"),), reporter);

        Ok(())
    }

    /// Submit verified parametric weather metrics for a region
    pub fn report_weather(
        env: Env,
        reporter: Address,
        region: Symbol,
        rainfall_mm: u32,
        historical_avg_rainfall_mm: u32,
        drought_index: u32,
        extreme_temp_flag: bool,
    ) -> Result<(), WeatherOracleError> {
        reporter.require_auth();

        if drought_index > 100 {
            return Err(WeatherOracleError::InvalidMetrics);
        }

        let reporters: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Reporters)
            .ok_or(WeatherOracleError::NotInitialized)?;

        let mut is_authorized = false;
        for r in reporters.iter() {
            if r == reporter {
                is_authorized = true;
                break;
            }
        }

        if !is_authorized {
            return Err(WeatherOracleError::Unauthorized);
        }

        let timestamp = env.ledger().timestamp();

        let metrics = WeatherMetrics {
            rainfall_mm,
            historical_avg_rainfall_mm,
            drought_index,
            extreme_temp_flag,
            timestamp,
            reporter: reporter.clone(),
        };

        env.storage().persistent().set(&DataKey::Metrics(region.clone()), &metrics);
        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("w_update"), region),
            (drought_index, rainfall_mm, timestamp),
        );

        Ok(())
    }

    /// Fetch latest recorded weather metrics for a region
    pub fn get_metrics(env: Env, region: Symbol) -> Result<WeatherMetrics, WeatherOracleError> {
        env.storage()
            .persistent()
            .get(&DataKey::Metrics(region))
            .ok_or(WeatherOracleError::RegionNotFound)
    }

    /// Check if regional drought index meets or exceeds parametric insurance payout threshold
    pub fn check_drought_trigger(
        env: Env,
        region: Symbol,
        threshold: u32,
    ) -> Result<bool, WeatherOracleError> {
        let metrics = Self::get_metrics(env, region)?;
        Ok(metrics.drought_index >= threshold)
    }

    /// Check if regional rainfall meets or exceeds parametric flood payout threshold
    pub fn check_flood_trigger(
        env: Env,
        region: Symbol,
        flood_threshold_mm: u32,
    ) -> Result<bool, WeatherOracleError> {
        let metrics = Self::get_metrics(env, region)?;
        Ok(metrics.rainfall_mm >= flood_threshold_mm)
    }

    /// Calculate net deviation of current rainfall from regional historical baseline in mm
    pub fn get_deviation_from_baseline(
        env: Env,
        region: Symbol,
    ) -> Result<i32, WeatherOracleError> {
        let metrics = Self::get_metrics(env, region)?;
        Ok((metrics.rainfall_mm as i32) - (metrics.historical_avg_rainfall_mm as i32))
    }

    /// Fetch authorized reporters
    pub fn get_reporters(env: Env) -> Result<Vec<Address>, WeatherOracleError> {
        env.storage()
            .instance()
            .get(&DataKey::Reporters)
            .ok_or(WeatherOracleError::NotInitialized)
    }

    /// Fetch admin address
    pub fn get_admin(env: Env) -> Result<Address, WeatherOracleError> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(WeatherOracleError::NotInitialized)
    }
}

#[cfg(test)]
mod test;

