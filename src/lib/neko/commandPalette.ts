import type { CommandAction } from "./types";

export const commandActions: CommandAction[] = [
  { id: "open-folder", shortcut: "Ctrl/Cmd+Shift+O" },
  { id: "open-file", shortcut: "Ctrl/Cmd+O" },
  { id: "quick-switcher", shortcut: "Ctrl/Cmd+P" },
  { id: "search", shortcut: "Ctrl/Cmd+F" },
  { id: "toggle-view", shortcut: "Ctrl/Cmd+E" },
  { id: "toggle-outline", shortcut: "Ctrl/Cmd+I" },
  { id: "toggle-sidebar", shortcut: "Ctrl/Cmd+B" },
  { id: "toggle-theme", shortcut: "Ctrl/Cmd+J" },
  { id: "zen", shortcut: "Ctrl/Cmd+Shift+Z" },
  { id: "open-external", shortcut: "Ctrl/Cmd+Shift+E" },
  { id: "reveal", shortcut: "Ctrl/Cmd+Shift+R" },
  { id: "settings", shortcut: "Ctrl/Cmd+," },
];
