(function initObserver(global) {
  const { debounce } = global.EliminateShortsDebounce;

  let settingsCache = null;
  let observer = null;
  let pendingRoots = new Set();
  let running = false;

  async function refreshSettings() {
    settingsCache = await global.EliminateShortsStorage.getSettings();
  }

  function scheduleProcess(root) {
    if (!root) return;
    pendingRoots.add(root);
    processPending();
  }

  const processPending = debounce(async () => {
    if (running) return;
    running = true;

    await global.EliminateShortsStats.resetDailyIfNeeded();
    if (!settingsCache) await refreshSettings();

    if (!settingsCache.enabled) {
      pendingRoots.clear();
      running = false;
      return;
    }

    const roots = Array.from(pendingRoots);
    pendingRoots.clear();

    const execute = async () => {
      // Process only queued roots to keep work proportional to DOM mutations.
      let totalRemoved = 0;

      for (const root of roots) {
        const candidates = global.EliminateShortsDetector.findShortsCandidates(root, settingsCache);
        const removed = global.EliminateShortsRemover.removeCandidates(candidates);
        totalRemoved += removed;
      }

      if (totalRemoved > 0) {
        await global.EliminateShortsStats.incrementRemoved(totalRemoved);
      }

      running = false;
    };

    // Use idle time when available to reduce visible jank on heavy YouTube pages.
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        execute();
      }, { timeout: 250 });
    } else {
      setTimeout(() => {
        execute();
      }, 0);
    }
  }, 120);

  function startObserver() {
    if (observer || !document.body) return;

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            scheduleProcess(node);
          }
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function watchNavigation() {
    let lastUrl = location.href;
    const navObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        global.EliminateShortsStats.resetCurrentPageRemovals();
        global.EliminateShortsRedirector.maybeRedirect();
        scheduleProcess(document.body);
      }
    });

    navObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== "sync") return;

    if (
      changes.enabled ||
      changes.redirectShortsUrls ||
      changes.redirectTarget ||
      changes.hideUnderDuration ||
      changes.maxDurationSeconds ||
      changes.removeNotifications ||
      changes.aggressiveCleanup
    ) {
      await refreshSettings();
      global.EliminateShortsRedirector.maybeRedirect();
      scheduleProcess(document.body);
    }
  });

  (async function boot() {
    await refreshSettings();
    await global.EliminateShortsStats.resetCurrentPageRemovals();
    await global.EliminateShortsRedirector.maybeRedirect();
    scheduleProcess(document.documentElement);

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        startObserver();
        watchNavigation();
        scheduleProcess(document.body);
      }, { once: true });
    } else {
      startObserver();
      watchNavigation();
      scheduleProcess(document.body);
    }
  })();
})(window);
