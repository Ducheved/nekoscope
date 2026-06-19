import { writable } from "svelte/store";
import type { AppSettings, LocaleCode } from "./types";

const storageKey = "nekoscope-settings";

function detectLocale(): LocaleCode {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language?.toLowerCase() ?? "en";
  if (lang.startsWith("ru")) return "ru";
  if (lang.startsWith("ja")) return "ja";
  if (lang.startsWith("zh")) return "zh";
  return "en";
}

export const defaultSettings: AppSettings = {
  locale: "en",
  theme: "system",
  fontScale: 1,
};

export const settingsStore = writable<AppSettings>(loadSettings());

settingsStore.subscribe((value) => {
  const storage = browserStorage();
  if (storage) {
    storage.setItem(storageKey, JSON.stringify(value));
  }
});

export function loadSettings(): AppSettings {
  const base: AppSettings = { ...defaultSettings, locale: detectLocale() };
  const storage = browserStorage();
  if (!storage) return base;
  const raw = storage.getItem(storageKey);
  if (!raw) return base;
  try {
    return { ...base, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return base;
  }
}

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
