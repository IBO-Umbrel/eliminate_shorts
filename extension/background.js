const DEFAULT_SETTINGS = {
  enabled: true,
  redirectShortsUrls: true,
  redirectTarget: "home",
  hideUnderDuration: false,
  maxDurationSeconds: 60,
  removeNotifications: true,
  aggressiveCleanup: true,
  stats: {
    date: "",
    removedToday: 0
  }
};

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get();
  const merged = {
    ...DEFAULT_SETTINGS,
    ...existing,
    stats: {
      ...DEFAULT_SETTINGS.stats,
      ...(existing.stats || {})
    }
  };

  if (!merged.stats.date) {
    merged.stats.date = new Date().toISOString().slice(0, 10);
  }

  await chrome.storage.sync.set(merged);
});
