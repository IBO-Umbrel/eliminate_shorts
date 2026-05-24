(function initDetector(global) {
  const STRUCTURAL_SELECTORS = [
    "ytd-reel-shelf-renderer",
    "ytd-rich-shelf-renderer",
    "ytd-reel-video-renderer",
    "ytd-shorts-lockup-view-model",
    "ytm-shorts-lockup-view-model",
    "yt-horizontal-list-renderer",
    "ytd-rich-section-renderer"
  ];

  const LINK_SELECTORS = [
    "a[href*='/shorts/']",
    "a[title*='Shorts']",
    "a[aria-label*='Shorts']"
  ];

  const TEXT_PATTERNS = [/^shorts$/i, /short-form/i, /short video/i];
  const NOTIFICATION_SELECTOR = "ytd-notification-renderer";
  const HEURISTIC_ITEM_SELECTORS = [
    "ytd-rich-item-renderer",
    "ytd-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer",
    "ytd-guide-entry-renderer",
    "ytd-mini-guide-entry-renderer",
    "ytd-notification-renderer"
  ].join(", ");

  function hasShortsText(node) {
    if (!(node instanceof Element)) return false;
    const text = [
      node.getAttribute("aria-label") || "",
      node.getAttribute("title") || "",
      node.textContent ? node.textContent.trim().slice(0, 200) : ""
    ].join(" ");

    return TEXT_PATTERNS.some((pattern) => pattern.test(text));
  }

  function hasShortsLink(node) {
    if (!(node instanceof Element)) return false;
    if (node.matches?.("a[href*='/shorts/']")) return true;
    return !!node.querySelector?.("a[href*='/shorts/']");
  }

  function matchesShortsStructure(node) {
    if (!(node instanceof Element)) return false;
    return STRUCTURAL_SELECTORS.some((selector) => node.matches?.(selector));
  }

  function detectDurationSeconds(node) {
    if (!(node instanceof Element)) return null;
    const badge = node.querySelector?.("ytd-thumbnail-overlay-time-status-renderer, span.ytd-thumbnail-overlay-time-status-renderer");
    if (!badge || !badge.textContent) return null;

    const cleaned = badge.textContent.trim().replace(/\s/g, "");
    const parts = cleaned.split(":").map((x) => Number(x));
    if (parts.some(Number.isNaN)) return null;

    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return null;
  }

  function findShortsCandidates(root, settings) {
    const found = new Set();

    for (const selector of STRUCTURAL_SELECTORS.concat(LINK_SELECTORS)) {
      root.querySelectorAll?.(selector).forEach((el) => found.add(el));
    }

    root.querySelectorAll?.("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ytd-notification-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer").forEach((el) => {
      if (hasShortsLink(el) || (settings.aggressiveCleanup && hasShortsText(el))) {
        found.add(el);
      }

      if (settings.removeNotifications && el.matches(NOTIFICATION_SELECTOR) && hasShortsText(el)) {
        found.add(el);
      }

      if (settings.hideUnderDuration) {
        const duration = detectDurationSeconds(el);
        if (duration !== null && duration <= settings.maxDurationSeconds) {
          found.add(el);
        }
      }
    });

    if (settings.aggressiveCleanup) {
      root.querySelectorAll?.(HEURISTIC_ITEM_SELECTORS).forEach((el) => {
        if (hasShortsText(el) || hasShortsLink(el)) {
          found.add(el);
        }
      });
    }

    return found;
  }

  global.EliminateShortsDetector = {
    findShortsCandidates,
    hasShortsText,
    hasShortsLink
  };
})(window);
