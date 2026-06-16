import { writable } from "svelte/store";
import { defaultProviderProfile } from "./providerProfiles";
import type { AppSettings } from "./types";

const storageKey = "nekoscope-settings";

export const defaultSettings: AppSettings = {
  locale: "en",
  theme: "system",
  fontScale: 1,
  diagramScale: 1,
  providerProfile: defaultProviderProfile,
  syncProfiles: [],
  includeCurrentFile: true,
  includeSelectedText: true,
  includeRenderedOutline: true,
  includeFolderIndex: false,
  includeComments: true,
  secretRedaction: true,
  trustedHtmlWorkspaces: [],
};

export const settingsStore = writable<AppSettings>(loadSettings());

settingsStore.subscribe((value) => {
  const storage = browserStorage();
  if (storage) {
    storage.setItem(storageKey, JSON.stringify(value));
  }
});

export function loadSettings(): AppSettings {
  const storage = browserStorage();
  if (!storage) return defaultSettings;
  const raw = storage.getItem(storageKey);
  if (!raw) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
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
