import { invoke } from "@tauri-apps/api/core";

export function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function invokeNeko<T>(
  command: string,
  args: Record<string, unknown>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  if (!isTauriRuntime()) return fallback();
  return invoke<T>(command, args);
}

export async function openFolderDialog(): Promise<string | null> {
  if (!isTauriRuntime()) return null;
  const dialog = await import("@tauri-apps/plugin-dialog");
  const selected = await dialog.open({ directory: true, multiple: false });
  return typeof selected === "string" ? selected : null;
}

export async function openFileDialog(): Promise<string | null> {
  if (!isTauriRuntime()) return null;
  const dialog = await import("@tauri-apps/plugin-dialog");
  const selected = await dialog.open({
    directory: false,
    multiple: false,
    filters: [
      {
        name: "Documents",
        extensions: [
          "md",
          "markdown",
          "mdx",
          "txt",
          "json",
          "jsonc",
          "yaml",
          "yml",
          "toml",
        ],
      },
    ],
  });
  return typeof selected === "string" ? selected : null;
}

export async function onTauriEvent<T>(
  event: string,
  handler: (payload: T) => void,
): Promise<() => void> {
  if (!isTauriRuntime()) return () => {};
  const { listen } = await import("@tauri-apps/api/event");
  const unlisten = await listen<T>(event, (message) =>
    handler(message.payload),
  );
  return unlisten;
}

export async function onFileDrop(
  handler: (paths: string[]) => void,
): Promise<() => void> {
  if (!isTauriRuntime()) return () => {};
  const { getCurrentWebview } = await import("@tauri-apps/api/webview");
  const unlisten = await getCurrentWebview().onDragDropEvent((event) => {
    if (event.payload.type === "drop") {
      handler(event.payload.paths);
    }
  });
  return unlisten;
}
