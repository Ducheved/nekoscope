import type { ThemeMode } from "./types";

export const themeModes: Array<{ value: ThemeMode; label: string }> = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const themeTokens = {
  sakuraBg: "#f7eef3",
  mochiSurface: "rgba(255, 255, 255, 0.72)",
  nekoInk: "#182026",
  mikanAccent: "#f08a4b",
  matchaSuccess: "#4f9d69",
  umeDanger: "#c8495f",
  yukiBorder: "rgba(74, 85, 104, 0.18)",
  kumoMuted: "#687383",
};

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.dataset.theme = mode;
}
