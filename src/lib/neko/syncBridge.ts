import type { SyncProfile } from "./types";

export const defaultSyncProfile: SyncProfile = {
  id: "mounted-storage",
  name: "Mounted storage",
  providerType: "cloud-mounted-folder",
  rootPath: "",
  enabled: false,
};

export function createSyncManifest(profile: SyncProfile) {
  return {
    profileId: profile.id,
    name: profile.name,
    providerType: profile.providerType,
    enabled: profile.enabled,
    stores: ["settings", "comments", "workspace-pins"],
  };
}

export function syncProfileReady(profile: SyncProfile) {
  return profile.enabled && profile.rootPath.trim().length > 0;
}
