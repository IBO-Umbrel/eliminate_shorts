(function initObserver(global: Window) {
  const { debounce } = global.EliminateShortsDebounce;

  let settingsCache: any = null;
  let observer: MutationObserver | null = null;
  const pendingRoots = new Set<ParentNode>();
  let running = false;
  let lastUrl = location.href;

  async function refreshSettings() {
    settingsCache = await global.EliminateShortsStorage.getSettings();
  }

  function scheduleProcess(root: ParentNode | null): void {
    if (!root) return;
    pendingRoots.add(root);
    processPending();
  }

  const processPending = debounce(async () => {
    if (running) return;
    running = true;

    await global.EliminateShortsStats.resetDailyIfNeeded();
    if (!settingsCache) await refreshSettings();

    if (!settingsCache?.enabled) {
      pendingRoots.clear();
      running = false;
      return;
    }

    const roots = Array.from(pendingRoots);
    pendingRoots.clear();

    const execute = async () => {
      let totalRemoved = 0;
      for (const root of roots) {
        const candidates = global.EliminateShortsDetector.findShortsCandidates(root, settingsCache);
        const removed = global.EliminateShortsRemover.removeCandidates(candidates, settingsCache);
        totalRemoved += removed;
      }
      if (totalRemoved > 0) {
        await global.EliminateShortsStats.incrementRemoved(totalRemoved);
      }
      running = false;
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(() => {
        void execute();
      }, { timeout: 250 });
    } else {
      setTimeout(() => {
        void execute();
      }, 0);
    }
  }, 120);

  function startObserver(): void {
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

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function onRouteChanged(): void {
    void global.EliminateShortsStats.resetCurrentPageRemovals();
    void global.EliminateShortsRedirector.maybeRedirect();
    scheduleProcess(document.body);
  }

  function checkUrlChanged(): void {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    onRouteChanged();
  }

  function watchNavigation(): void {
    const events = ["yt-navigate-finish", "yt-page-data-updated", "yt-location-changed", "popstate", "hashchange"];
    events.forEach((eventName) => {
      window.addEventListener(eventName, checkUrlChanged);
    });

    // Fallback for navigation styles not covered by events.
    setInterval(checkUrlChanged, 1000);
  }

  chrome.storage.onChanged.addListener((changes: any, areaName: string) => {
    if (areaName !== "sync") return;

    if (changes.enabled || changes.redirectShortsUrls || changes.redirectTarget || changes.hideUnderDuration || changes.maxDurationSeconds || changes.removeNotifications || changes.aggressiveCleanup) {
      void refreshSettings().then(() => {
        void global.EliminateShortsRedirector.maybeRedirect();
        scheduleProcess(document.body);
      });
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
