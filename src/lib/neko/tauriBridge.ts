import { invoke } from "@tauri-apps/api/core";

export function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function invokeNeko<T>(
  command: string,
  args: Record<string, unknown>,
  fallback: () => T | Promise<T>,
) {
  if (!isTauriRuntime()) return fallback();
  return invoke<T>(command, args);
}

export async function openFolderDialog() {
  if (!isTauriRuntime()) return null;
  const dialog = await import("@tauri-apps/plugin-dialog");
  const selected = await dialog.open({ directory: true, multiple: false });
  return typeof selected === "string" ? selected : null;
}
