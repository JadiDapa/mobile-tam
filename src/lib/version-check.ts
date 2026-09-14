import * as Application from 'expo-application';

const VERSION_CHECK_URL = process.env.EXPO_PUBLIC_VERSION_CHECK_URL;

type RemoteVersionInfo = {
  latestVersion: string;
  apkUrl: string;
  notes?: string;
};

export type VersionCheckResult = {
  updateAvailable: boolean;
  apkUrl?: string;
  notes?: string;
  latestVersion?: string;
};

const NO_UPDATE: VersionCheckResult = { updateAvailable: false };

function isNewerVersion(latest: string, current: string): boolean {
  const latestParts = latest.split('.').map((part) => Number(part) || 0);
  const currentParts = current.split('.').map((part) => Number(part) || 0);
  const length = Math.max(latestParts.length, currentParts.length);

  for (let i = 0; i < length; i++) {
    const latestPart = latestParts[i] ?? 0;
    const currentPart = currentParts[i] ?? 0;
    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }
  return false;
}

/**
 * Checks a static JSON manifest for a newer APK build. This is the native/SDK-change
 * update path — EAS Update (see `use-ota-updates.ts`) can't help here since it only
 * ships JS/asset changes to a runtime that's already installed.
 *
 * Never throws: a missing config, offline device, or malformed response all resolve
 * to "no update available" so this never blocks app usage.
 */
export async function checkForApkUpdate(): Promise<VersionCheckResult> {
  if (!VERSION_CHECK_URL) {
    console.warn('[version-check] EXPO_PUBLIC_VERSION_CHECK_URL is not set, skipping check');
    return NO_UPDATE;
  }

  const currentVersion = Application.nativeApplicationVersion;
  if (!currentVersion) return NO_UPDATE;

  try {
    const response = await fetch(VERSION_CHECK_URL);
    if (!response.ok) return NO_UPDATE;

    const data = (await response.json()) as Partial<RemoteVersionInfo>;
    if (!data.latestVersion || !data.apkUrl) return NO_UPDATE;

    if (!isNewerVersion(data.latestVersion, currentVersion)) return NO_UPDATE;

    return {
      updateAvailable: true,
      apkUrl: data.apkUrl,
      notes: data.notes,
      latestVersion: data.latestVersion,
    };
  } catch (error) {
    console.warn('[version-check] failed to check for APK update', error);
    return NO_UPDATE;
  }
}
