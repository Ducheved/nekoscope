use std::{
    path::{Path, PathBuf},
    process::Command,
};

use crate::domain::{
    errors::{NekoError, NekoResult},
    models::{IdeOpenRequest, IdeOpenResult},
};

pub fn open_in_ide(request: IdeOpenRequest) -> NekoResult<IdeOpenResult> {
    let target = PathBuf::from(&request.path);
    let method = request.ide.to_ascii_lowercase();
    match method.as_str() {
        "system" | "default" => {
            opener::open(&target).map_err(|error| NekoError::Open(error.to_string()))?;
        }
        "code" | "vscode" => {
            run_allowed("code", &[line_arg(&target, request.line)])?;
        }
        "cursor" => {
            run_allowed("cursor", &[line_arg(&target, request.line)])?;
        }
        "sublime" => {
            run_allowed("subl", &[line_arg(&target, request.line)])?;
        }
        "zed" => {
            run_allowed("zed", &[target.to_string_lossy().to_string()])?;
        }
        "custom" => {
            let command = request.custom_command.ok_or(NekoError::CommandNotAllowed)?;
            run_custom(&command, &target, request.line)?;
        }
        _ => return Err(NekoError::CommandNotAllowed),
    }
    Ok(IdeOpenResult {
        opened: true,
        target: target.to_string_lossy().to_string(),
        method,
    })
}

pub fn reveal_in_file_manager(path: &str) -> NekoResult<IdeOpenResult> {
    let target = PathBuf::from(path);
    opener::reveal(&target).map_err(|error| NekoError::Open(error.to_string()))?;
    Ok(IdeOpenResult {
        opened: true,
        target: target.to_string_lossy().to_string(),
        method: "file-manager".to_string(),
    })
}

fn line_arg(path: &Path, line: Option<u32>) -> String {
    match line {
        Some(line) => format!("{}:{line}", path.to_string_lossy()),
        None => path.to_string_lossy().to_string(),
    }
}

fn run_allowed(command: &str, args: &[String]) -> NekoResult<()> {
    Command::new(command).args(args).spawn()?.wait()?;
    Ok(())
}

fn run_custom(template: &str, path: &Path, line: Option<u32>) -> NekoResult<()> {
    let rendered = template
        .replace("{path}", &path.to_string_lossy())
        .replace("{line}", &line.unwrap_or(1).to_string());
    let mut parts = rendered.split_whitespace();
    let command = parts.next().ok_or(NekoError::CommandNotAllowed)?;
    let allowed = ["code", "cursor", "subl", "zed"];
    if !allowed.contains(&command) {
        return Err(NekoError::CommandNotAllowed);
    }
    let args: Vec<String> = parts.map(str::to_string).collect();
    run_allowed(command, &args)
}
