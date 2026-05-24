(function initPopup() {
  const els = {
    statusBadge: document.getElementById("statusBadge") as HTMLElement,
    enabledToggle: document.getElementById("enabledToggle") as HTMLInputElement,
    redirectShortsUrls: document.getElementById("redirectShortsUrls") as HTMLInputElement,
    redirectTarget: document.getElementById("redirectTarget") as HTMLSelectElement,
    hideUnderDuration: document.getElementById("hideUnderDuration") as HTMLInputElement,
    maxDurationSeconds: document.getElementById("maxDurationSeconds") as HTMLInputElement,
    durationGroup: document.getElementById("durationGroup") as HTMLElement,
    durationValue: document.getElementById("durationValue") as HTMLElement,
    removeNotifications: document.getElementById("removeNotifications") as HTMLInputElement,
    aggressiveCleanup: document.getElementById("aggressiveCleanup") as HTMLInputElement,
    removedToday: document.getElementById("removedToday") as HTMLElement,
    currentPageRemovals: document.getElementById("currentPageRemovals") as HTMLElement
  };

  function setBadge(enabled: boolean): void {
    els.statusBadge.textContent = enabled ? "ACTIVE" : "DISABLED";
    els.statusBadge.classList.toggle("active", enabled);
  }

  function updateDurationVisibility(show: boolean): void {
    els.durationGroup.classList.toggle("hidden", !show);
  }

  async function saveSettings() {
    const next = {
      enabled: els.enabledToggle.checked,
      redirectShortsUrls: els.redirectShortsUrls.checked,
      redirectTarget: els.redirectTarget.value,
      hideUnderDuration: els.hideUnderDuration.checked,
      maxDurationSeconds: Number(els.maxDurationSeconds.value),
      removeNotifications: els.removeNotifications.checked,
      aggressiveCleanup: els.aggressiveCleanup.checked
    };

    await chrome.storage.sync.set(next);
    setBadge(next.enabled);
    updateDurationVisibility(next.hideUnderDuration);
  }

  function attachHandlers(): void {
    [els.enabledToggle, els.redirectShortsUrls, els.redirectTarget, els.hideUnderDuration, els.maxDurationSeconds, els.removeNotifications, els.aggressiveCleanup].forEach((el) =>
      el.addEventListener("change", () => {
        void saveSettings();
      })
    );

    els.maxDurationSeconds.addEventListener("input", () => {
      els.durationValue.textContent = `${els.maxDurationSeconds.value}s`;
    });
  }

  async function populateStats() {
    const local = await chrome.storage.local.get({ currentPageRemovals: 0 });
    els.currentPageRemovals.textContent = String(local.currentPageRemovals || 0);
  }

  async function init() {
    const settings = await window.EliminateShortsStorage.getSettings();

    els.enabledToggle.checked = settings.enabled;
    els.redirectShortsUrls.checked = settings.redirectShortsUrls;
    els.hideUnderDuration.checked = settings.hideUnderDuration;
    els.redirectTarget.value = settings.redirectTarget || "home";
    els.maxDurationSeconds.value = String(settings.maxDurationSeconds);
    els.durationValue.textContent = `${settings.maxDurationSeconds}s`;
    els.removeNotifications.checked = settings.removeNotifications;
    els.aggressiveCleanup.checked = settings.aggressiveCleanup;
    els.removedToday.textContent = String(settings.stats.removedToday || 0);

    setBadge(settings.enabled);
    updateDurationVisibility(settings.hideUnderDuration);
    attachHandlers();
    await populateStats();
  }

  void init();
})();
