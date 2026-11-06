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
    IsReporter(Address),
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
        env.storage()
            .instance()
            .set(&DataKey::Reporters, &empty_reporters);

        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

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

        if env
            .storage()
            .instance()
            .get(&DataKey::IsReporter(reporter.clone()))
            .unwrap_or(false)
        {
            return Err(WeatherOracleError::ReporterAlreadyExists);
        }

        let mut reporters: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Reporters)
            .unwrap_or(Vec::new(&env));

        reporters.push_back(reporter.clone());
        env.storage()
            .instance()
            .set(&DataKey::Reporters, &reporters);
        env.storage()
            .instance()
            .set(&DataKey::IsReporter(reporter.clone()), &true);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events()
            .publish((symbol_short!("w_rep_add"),), reporter);

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

        let is_rep = env
            .storage()
            .instance()
            .get(&DataKey::IsReporter(reporter.clone()))
            .unwrap_or(false);
        if !is_rep {
            return Err(WeatherOracleError::ReporterNotFound);
        }

        let reporters: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Reporters)
            .unwrap_or(Vec::new(&env));

        let mut updated: Vec<Address> = Vec::new(&env);
        for r in reporters.iter() {
            if r != reporter {
                updated.push_back(r);
            }
        }

        env.storage()
            .instance()
            .remove(&DataKey::IsReporter(reporter.clone()));
        env.storage().instance().set(&DataKey::Reporters, &updated);
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish((symbol_short!("w_rep_rm"),), reporter);

        Ok(())
    }

    /// Update the long-term historical baseline rainfall for a regional microclimate zone
    pub fn update_baseline_rainfall(
        env: Env,
        region: Symbol,
        new_baseline_mm: u32,
    ) -> Result<(), WeatherOracleError> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(WeatherOracleError::NotInitialized)?;

        admin.require_auth();

        if let Some(mut metrics) = env
            .storage()
            .persistent()
            .get::<_, WeatherMetrics>(&DataKey::Metrics(region.clone()))
        {
            metrics.historical_avg_rainfall_mm = new_baseline_mm;
            env.storage()
                .persistent()
                .set(&DataKey::Metrics(region.clone()), &metrics);
            env.storage().persistent().extend_ttl(
                &DataKey::Metrics(region.clone()),
                INSTANCE_LIFETIME_THRESHOLD,
                INSTANCE_BUMP_AMOUNT,
            );
        }

        env.events()
            .publish((symbol_short!("w_base"), region), new_baseline_mm);

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

        if !env.storage().instance().has(&DataKey::Admin) {
            return Err(WeatherOracleError::NotInitialized);
        }

        if !Self::is_reporter(env.clone(), reporter.clone()) {
            return Err(WeatherOracleError::Unauthorized);
        }

        let timestamp = env.ledger().timestamp();

        if let Some(existing) = env
            .storage()
            .persistent()
            .get::<_, WeatherMetrics>(&DataKey::Metrics(region.clone()))
        {
            if timestamp < existing.timestamp {
                return Err(WeatherOracleError::MetricsStale);
            }
        }

        let metrics = WeatherMetrics {
            rainfall_mm,
            historical_avg_rainfall_mm,
            drought_index,
            extreme_temp_flag,
            timestamp,
            reporter: reporter.clone(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Metrics(region.clone()), &metrics);
        env.storage().persistent().extend_ttl(
            &DataKey::Metrics(region.clone()),
            INSTANCE_LIFETIME_THRESHOLD,
            INSTANCE_BUMP_AMOUNT,
        );
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

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

    /// Fetch latest recorded weather metrics with staleness validation
    pub fn get_metrics_safe(
        env: Env,
        region: Symbol,
        max_staleness_seconds: u64,
    ) -> Result<WeatherMetrics, WeatherOracleError> {
        let metrics = Self::get_metrics(env.clone(), region)?;
        let current_time = env.ledger().timestamp();
        if current_time > metrics.timestamp + max_staleness_seconds {
            return Err(WeatherOracleError::MetricsStale);
        }
        Ok(metrics)
    }

    /// Check if regional weather metrics are fresh within allowed age
    pub fn is_fresh(env: Env, region: Symbol, max_age_seconds: u64) -> bool {
        Self::get_metrics_safe(env, region, max_age_seconds).is_ok()
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

    /// Returns the total count of authorized weather reporters
    pub fn get_reporters_count(env: Env) -> u32 {
        let reporters: Vec<Address> = env
            .storage()
            .instance()
            .get(&DataKey::Reporters)
            .unwrap_or(Vec::new(&env));
        reporters.len()
    }

    /// Verifies if a given address is an authorized weather reporter
    pub fn is_reporter(env: Env, reporter: Address) -> bool {
        env.storage()
            .instance()
            .get(&DataKey::IsReporter(reporter))
            .unwrap_or(false)
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
