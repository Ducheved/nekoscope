import type { CommandAction } from "./types";

export const commandActions: CommandAction[] = [
  {
    id: "open-folder",
    label: "Open Folder",
    shortcut: "Ctrl/Cmd+Shift+O",
    panel: "workspace",
  },
  {
    id: "open-file",
    label: "Open File",
    shortcut: "Ctrl/Cmd+O",
    panel: "workspace",
  },
  {
    id: "quick-switcher",
    label: "Quick Switcher",
    shortcut: "Ctrl/Cmd+P",
    panel: "quick",
  },
  { id: "search", label: "Search", shortcut: "Ctrl/Cmd+F", panel: "search" },
  {
    id: "mindmap",
    label: "Mindmap",
    shortcut: "Ctrl/Cmd+Shift+M",
    panel: "mindmap",
  },
  { id: "ask-ai", label: "Ask AI", shortcut: "Ctrl/Cmd+Enter", panel: "ai" },
  {
    id: "open-ide",
    label: "Open in IDE",
    shortcut: "Ctrl/Cmd+Shift+I",
    panel: "ide",
  },
];

export function filterCommands(query: string) {
  const needle = query.trim().toLowerCase();
  return commandActions.filter((command) =>
    command.label.toLowerCase().includes(needle),
  );
}
