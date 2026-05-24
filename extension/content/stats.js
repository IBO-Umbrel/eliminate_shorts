(function initStats(global) {
  const PAGE_STATE = {
    currentPageRemovals: 0
  };

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }

  async function resetDailyIfNeeded() {
    const settings = await global.EliminateShortsStorage.getSettings();
    if (settings.stats.date !== todayIso()) {
      settings.stats.date = todayIso();
      settings.stats.removedToday = 0;
      await global.EliminateShortsStorage.setSettings({ stats: settings.stats });
    }
  }

  async function incrementRemoved(count) {
    if (!count) return;
    PAGE_STATE.currentPageRemovals += count;

    const settings = await global.EliminateShortsStorage.getSettings();
    if (settings.stats.date !== todayIso()) {
      settings.stats.date = todayIso();
      settings.stats.removedToday = 0;
    }
    settings.stats.removedToday += count;

    await global.EliminateShortsStorage.setSettings({ stats: settings.stats });
    await chrome.storage.local.set({ currentPageRemovals: PAGE_STATE.currentPageRemovals });
  }

  function getCurrentPageRemovals() {
    return PAGE_STATE.currentPageRemovals;
  }

  async function resetCurrentPageRemovals() {
    PAGE_STATE.currentPageRemovals = 0;
    await chrome.storage.local.set({ currentPageRemovals: 0 });
  }

  global.EliminateShortsStats = {
    resetDailyIfNeeded,
    incrementRemoved,
    getCurrentPageRemovals,
    resetCurrentPageRemovals
  };
})(window);
