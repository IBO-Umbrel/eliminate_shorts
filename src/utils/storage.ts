(function initStorage(global: Window) {
  const DEFAULT_SETTINGS = {
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

  async function getSettings() {
    const saved = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      stats: {
        ...DEFAULT_SETTINGS.stats,
        ...(saved.stats || {})
      }
    };
  }

  async function setSettings(next: Record<string, unknown>) {
    await chrome.storage.sync.set(next);
  }

  global.EliminateShortsStorage = {
    DEFAULT_SETTINGS,
    getSettings,
    setSettings
  };
})(window);
