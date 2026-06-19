import { resolveTheme } from "./themeTokens";

let initializedFor: "light" | "dark" | null = null;

const lightThemeVariables = {
  background: "transparent",
  primaryColor: "#f7f9ff",
  primaryBorderColor: "#8aa0ff",
  primaryTextColor: "#192235",
  secondaryColor: "#fff0f4",
  tertiaryColor: "#f2fbf8",
  lineColor: "#6f7c8f",
  textColor: "#192235",
  mainBkg: "#f7f9ff",
  noteBkgColor: "#fff7d6",
  noteTextColor: "#192235",
  actorBkg: "#ffffff",
  actorBorder: "#8aa0ff",
  actorTextColor: "#192235",
  signalColor: "#4f6fd8",
  signalTextColor: "#192235",
};

const darkThemeVariables = {
  background: "transparent",
  primaryColor: "#1d232c",
  primaryBorderColor: "#82a3ff",
  primaryTextColor: "#edf2f4",
  secondaryColor: "#2a2030",
  tertiaryColor: "#19251f",
  lineColor: "#9aa6b6",
  textColor: "#edf2f4",
  mainBkg: "#1d232c",
  noteBkgColor: "#3a3320",
  noteTextColor: "#edf2f4",
  actorBkg: "#222831",
  actorBorder: "#82a3ff",
  actorTextColor: "#edf2f4",
  signalColor: "#82a3ff",
  signalTextColor: "#edf2f4",
};

export async function renderMermaidSvg(source: string, id: string) {
  const mermaid = await import("mermaid");
  const mode = resolveTheme(
    (typeof document !== "undefined" &&
      (document.documentElement.dataset.themeMode as
        | "light"
        | "dark"
        | "system")) ||
      "light",
  );
  if (initializedFor !== mode) {
    mermaid.default.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: mode === "dark" ? "dark" : "base",
      flowchart: { curve: "basis" },
      sequence: { mirrorActors: false, showSequenceNumbers: true },
      themeVariables:
        mode === "dark" ? darkThemeVariables : lightThemeVariables,
    });
    initializedFor = mode;
  }
  const result = await mermaid.default.render(id, source);
  return result.svg;
}
