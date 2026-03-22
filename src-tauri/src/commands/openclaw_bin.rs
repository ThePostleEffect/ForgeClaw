use std::path::PathBuf;

/// Resolve the `openclaw` binary path.
///
/// On Windows, `std::process::Command::new("openclaw")` won't find npm
/// global .cmd shims unless the full path (or .cmd extension) is used.
/// This helper checks common locations in order:
///   1. Explicit path from settings (if provided)
///   2. npm global bin: %APPDATA%\npm\openclaw.cmd  (Windows)
///   3. Plain "openclaw" (works on Unix or if it's natively in PATH)
pub fn resolve(custom: Option<&str>) -> String {
    if let Some(p) = custom {
        if !p.is_empty() {
            return p.to_string();
        }
    }

    // On Windows, check the npm global .cmd shim first
    #[cfg(target_os = "windows")]
    {
        if let Some(appdata) = std::env::var_os("APPDATA") {
            let cmd_path = PathBuf::from(appdata).join("npm").join("openclaw.cmd");
            if cmd_path.exists() {
                return cmd_path.to_string_lossy().to_string();
            }
        }
        // Also check %LOCALAPPDATA%\npm
        if let Some(local) = std::env::var_os("LOCALAPPDATA") {
            let cmd_path = PathBuf::from(local).join("npm").join("openclaw.cmd");
            if cmd_path.exists() {
                return cmd_path.to_string_lossy().to_string();
            }
        }
        // Check user profile npm location
        if let Some(home) = dirs::home_dir() {
            let cmd_path = home
                .join("AppData")
                .join("Roaming")
                .join("npm")
                .join("openclaw.cmd");
            if cmd_path.exists() {
                return cmd_path.to_string_lossy().to_string();
            }
        }
    }

    // Fallback: rely on PATH
    "openclaw".to_string()
}
