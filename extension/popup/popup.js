(function initPopup() {
  const els = {
    statusBadge: document.getElementById("statusBadge"),
    enabledToggle: document.getElementById("enabledToggle"),
    redirectShortsUrls: document.getElementById("redirectShortsUrls"),
    redirectTarget: document.getElementById("redirectTarget"),
    hideUnderDuration: document.getElementById("hideUnderDuration"),
    maxDurationSeconds: document.getElementById("maxDurationSeconds"),
    durationGroup: document.getElementById("durationGroup"),
    durationValue: document.getElementById("durationValue"),
    removeNotifications: document.getElementById("removeNotifications"),
    aggressiveCleanup: document.getElementById("aggressiveCleanup"),
    removedToday: document.getElementById("removedToday"),
    currentPageRemovals: document.getElementById("currentPageRemovals")
  };

  function setBadge(enabled) {
    els.statusBadge.textContent = enabled ? "ACTIVE" : "DISABLED";
    els.statusBadge.classList.toggle("active", enabled);
  }

  function updateDurationVisibility(show) {
    els.durationGroup.classList.toggle("hidden", !show);
  }

  function bindLiveInputs() {
    els.maxDurationSeconds.addEventListener("input", () => {
      els.durationValue.textContent = `${els.maxDurationSeconds.value}s`;
    });
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

  function attachHandlers() {
    [
      els.enabledToggle,
      els.redirectShortsUrls,
      els.redirectTarget,
      els.hideUnderDuration,
      els.maxDurationSeconds,
      els.removeNotifications,
      els.aggressiveCleanup
    ].forEach((el) => el.addEventListener("change", saveSettings));
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

    bindLiveInputs();
    attachHandlers();
    await populateStats();
  }

  init();
})();
