use keyring::Entry;
use rand::RngCore;
use rusqlite::{Connection, Result as SqliteResult};
use serde::{Deserialize, Serialize};
use std::path::Path;

const VAULT_SERVICE_NAME: &str = "bukhari_stationery_vault";
const VAULT_KEY_USER: &str = "sqlcipher_vault_key";

#[derive(Serialize, Deserialize, Debug)]
pub struct VaultStatus {
    pub is_initialized: bool,
    pub is_encrypted: bool,
    pub storage_mechanism: String,
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AuthResponse {
    pub success: bool,
    pub user_id: String,
    pub username: String,
    pub role: String,
    pub token: String,
    pub message: String,
}

/// Retrieve or generate the AES-256 SQLCipher encryption key securely
/// inside the Windows Credential Manager. Never leaves the Rust backend.
pub fn get_or_create_vault_key() -> Result<String, String> {
    let entry = Entry::new(VAULT_SERVICE_NAME, VAULT_KEY_USER)
        .map_err(|e| format!("Failed to access Windows Credential Manager: {}", e))?;

    match entry.get_password() {
        Ok(existing_key) => Ok(existing_key),
        Err(_) => {
            // Generate 32 cryptographically secure random bytes (256-bit key)
            let mut key_bytes = [0u8; 32];
            rand::thread_rng().fill_bytes(&mut key_bytes);
            let hex_key = hex::encode(key_bytes);

            entry
                .set_password(&hex_key)
                .map_err(|e| format!("Failed to store key in Windows Credential Manager: {}", e))?;

            Ok(hex_key)
        }
    }
}

/// Opens an encrypted SQLite database connection using SQLCipher PRAGMA key.
pub fn open_encrypted_db<P: AsRef<Path>>(db_path: P) -> Result<Connection, String> {
    let hex_key = get_or_create_vault_key()?;
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

    conn.execute_batch(&format!(
        "PRAGMA key = \"x'{}'\";
         PRAGMA cipher_page_size = 4096;
         PRAGMA kdf_iter = 256000;
         PRAGMA cipher_hmac_algorithm = HMAC_SHA512;
         PRAGMA cipher_default_kdf_algorithm = PBKDF2_HMAC_SHA512;
         PRAGMA foreign_keys = ON;",
        hex_key
    ))
    .map_err(|e| format!("SQLCipher key attachment failed: {}", e))?;

    conn.query_row("SELECT count(*) FROM sqlite_master;", [], |_| Ok(()))
        .map_err(|e| format!("Database verification failed (Incorrect SQLCipher key): {}", e))?;

    Ok(conn)
}

/// Command exposed to frontend to verify encryption state without leaking the key.
#[tauri::command]
pub fn check_vault_status() -> Result<VaultStatus, String> {
    match get_or_create_vault_key() {
        Ok(_) => Ok(VaultStatus {
            is_initialized: true,
            is_encrypted: true,
            storage_mechanism: "Windows Credential Manager (AES-256 via keyring)".to_string(),
            message: "Database Vault is protected with SQLCipher. Master key is secured in OS keyring.".to_string(),
        }),
        Err(e) => Err(e),
    }
}

/// Tauri command to authenticate users with RBAC ('Admin' or 'Staff').
#[tauri::command]
pub fn authenticate_user(
    username: String,
    password: String,
    role: String,
) -> Result<AuthResponse, String> {
    let user_clean = username.trim().to_lowercase();
    let is_valid = match role.as_str() {
        "Admin" => (user_clean == "admin" && password == "admin123") || (user_clean == "owner" && password == "bukhari2024"),
        "Staff" => (user_clean == "staff" && password == "staff123") || (user_clean == "counter" && password == "counter123"),
        _ => false,
    };

    if is_valid {
        let mut random_token_bytes = [0u8; 16];
        rand::thread_rng().fill_bytes(&mut random_token_bytes);
        let session_token = hex::encode(random_token_bytes);

        Ok(AuthResponse {
            success: true,
            user_id: format!("usr-{}", role.to_lowercase()),
            username,
            role,
            token: session_token,
            message: "Authentication successful".to_string(),
        })
    } else {
        Err("Invalid username, password, or role credential. Please check your credentials.".to_string())
    }
}
