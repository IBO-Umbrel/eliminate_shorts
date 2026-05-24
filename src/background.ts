type StatsState = {
  date: string;
  removedToday: number;
};

type Settings = {
  enabled: boolean;
  redirectShortsUrls: boolean;
  redirectTarget: "home" | "subscriptions";
  hideUnderDuration: boolean;
  maxDurationSeconds: number;
  removeNotifications: boolean;
  aggressiveCleanup: boolean;
  stats: StatsState;
};

const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  redirectShortsUrls: true,
  redirectTarget: "home",
  hideUnderDuration: false,
  maxDurationSeconds: 60,
  removeNotifications: false,
  aggressiveCleanup: false,
  stats: {
    date: "",
    removedToday: 0
  }
};

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get();
  const merged: Settings = {
    ...DEFAULT_SETTINGS,
    ...existing,
    stats: {
      ...DEFAULT_SETTINGS.stats,
      ...((existing.stats as Partial<StatsState>) || {})
    }
  };

  if (!merged.stats.date) {
    merged.stats.date = new Date().toISOString().slice(0, 10);
  }

  await chrome.storage.sync.set(merged);
});
