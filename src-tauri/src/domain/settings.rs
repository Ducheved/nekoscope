use std::{fs, path::PathBuf};

use crate::domain::{
    errors::NekoResult,
    models::{ProviderProfile, SyncProfile},
};

pub fn save_provider_profile(mut profile: ProviderProfile) -> NekoResult<ProviderProfile> {
    profile.api_key = profile
        .api_key
        .as_ref()
        .map(|_| "<stored-in-secret-vault>".to_string());
    let path = settings_dir()?.join("provider-profiles.json");
    let mut profiles = read_provider_profiles(&path)?;
    profiles.retain(|item| item.id != profile.id);
    profiles.push(profile.clone());
    fs::write(path, serde_json::to_string_pretty(&profiles)?)?;
    Ok(profile)
}

pub fn save_sync_profile(profile: SyncProfile) -> NekoResult<SyncProfile> {
    if !profile.root_path.trim().is_empty() {
        fs::create_dir_all(&profile.root_path)?;
        let manifest = PathBuf::from(&profile.root_path).join(".nekoscope-sync.json");
        fs::write(
            manifest,
            serde_json::to_string_pretty(&serde_json::json!({
                "profileId": profile.id,
                "name": profile.name,
                "providerType": profile.provider_type
            }))?,
        )?;
    }
    let path = settings_dir()?.join("sync-profiles.json");
    let mut profiles = list_sync_profiles()?;
    profiles.retain(|item| item.id != profile.id);
    profiles.push(profile.clone());
    fs::write(path, serde_json::to_string_pretty(&profiles)?)?;
    Ok(profile)
}

pub fn list_sync_profiles() -> NekoResult<Vec<SyncProfile>> {
    let path = settings_dir()?.join("sync-profiles.json");
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(path)?;
    Ok(serde_json::from_str(&content)?)
}

fn read_provider_profiles(path: &PathBuf) -> NekoResult<Vec<ProviderProfile>> {
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(path)?;
    Ok(serde_json::from_str(&content)?)
}

fn settings_dir() -> NekoResult<PathBuf> {
    let base = dirs::config_dir().unwrap_or_else(|| std::env::temp_dir().join("nekoscope-config"));
    let path = base.join("NekoScope");
    fs::create_dir_all(&path)?;
    Ok(path)
}
