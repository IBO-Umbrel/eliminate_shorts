(function initDetector(global: Window) {
  const EXPLICIT_SHORTS_SELECTORS = [
    "ytd-reel-shelf-renderer",
    "ytd-shorts-lockup-view-model",
    "ytm-shorts-lockup-view-model",
    "ytm-shorts-lockup-view-model-v2",
    "ytd-reel-video-renderer",
    "a[href*='/shorts/']"
  ];

  const SHORTS_TEXT_PATTERNS = [/^shorts$/i, /^shorts\b/i];

  function hasShortsText(node: Node): boolean {
    if (!(node instanceof Element)) return false;
    const text = [node.getAttribute("aria-label") || "", node.getAttribute("title") || "", node.textContent ? node.textContent.trim().slice(0, 120) : ""].join(" ").trim();
    return SHORTS_TEXT_PATTERNS.some((pattern) => pattern.test(text));
  }

  function hasShortsLink(node: Node): boolean {
    if (!(node instanceof Element)) return false;
    if (node.matches("a[href*='/shorts/']")) return true;
    return Boolean(node.querySelector("a[href*='/shorts/']"));
  }

  function matchesExplicitShortsStructure(node: Node): boolean {
    if (!(node instanceof Element)) return false;
    return EXPLICIT_SHORTS_SELECTORS.some((selector) => node.matches(selector));
  }

  function detectDurationSeconds(node: Element): number | null {
    const badge = node.querySelector("ytd-thumbnail-overlay-time-status-renderer, span.ytd-thumbnail-overlay-time-status-renderer");
    if (!badge || !badge.textContent) return null;
    const cleaned = badge.textContent.trim().replace(/\s/g, "");
    const parts = cleaned.split(":").map((x) => Number(x));
    if (parts.some(Number.isNaN)) return null;
    if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
    if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
    return null;
  }

  function findShortsCandidates(root: ParentNode, settings: any): Set<Element> {
    const found = new Set<Element>();

    for (const selector of EXPLICIT_SHORTS_SELECTORS) {
      root.querySelectorAll(selector).forEach((el) => found.add(el));
    }

    root.querySelectorAll("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, yt-tab-shape").forEach((el) => {
      if (hasShortsLink(el) || hasShortsText(el)) {
        found.add(el);
      }
    });

    if (settings.removeNotifications) {
      root.querySelectorAll("ytd-notification-renderer").forEach((el) => {
        if (hasShortsLink(el) || hasShortsText(el)) {
          found.add(el);
        }
      });
    }

    if (settings.hideUnderDuration) {
      root.querySelectorAll("ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-rich-item-renderer").forEach((el) => {
        const duration = detectDurationSeconds(el);
        if (duration !== null && duration <= settings.maxDurationSeconds) {
          found.add(el);
        }
      });
    }

    if (settings.aggressiveCleanup) {
      root.querySelectorAll("ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer").forEach((el) => {
        if (hasShortsText(el)) {
          found.add(el);
        }
      });
    }

    if (root instanceof Element && matchesExplicitShortsStructure(root)) {
      found.add(root);
    }

    return found;
  }

  global.EliminateShortsDetector = { findShortsCandidates, hasShortsText, hasShortsLink };
})(window);
