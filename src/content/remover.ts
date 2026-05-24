(function initRemover(global: Window) {
  const processed = new WeakSet<Element>();
  const SEARCH_PATH_PREFIX = "/results";

  function isSearchPage(): boolean {
    return location.pathname.startsWith(SEARCH_PATH_PREFIX);
  }

  function isUnsafeRoot(node: Element): boolean {
    return (
      node === document.body ||
      node === document.documentElement ||
      node.id === "content" ||
      node.id === "page-manager" ||
      node.tagName === "YTD-APP"
    );
  }

  function maybeRemove(target: Element | null, bucket: Set<Element>): void {
    if (!target) return;
    if (!target.isConnected) return;
    if (processed.has(target)) return;
    if (isUnsafeRoot(target)) return;
    bucket.add(target);
  }

  function isShortsText(text: string | null | undefined): boolean {
    if (!text) return false;
    return text.trim().toLowerCase() === "shorts";
  }

  function getGeneralContainer(node: Element): Element | null {
    const candidate =
      node.closest(
        "ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ytd-rich-section-renderer, ytd-rich-shelf-renderer, ytd-reel-shelf-renderer, ytd-notification-renderer, ytd-item-section-renderer, ytd-shelf-renderer"
      ) || node;

    if (isUnsafeRoot(candidate)) return null;
    return candidate;
  }

  function removeSearchShortsContainers(): number {
    if (!isSearchPage()) return 0;
    let removed = 0;

    document.querySelectorAll("#contents > grid-shelf-view-model").forEach((shelf) => {
      const hasShortsHeader = Array.from(shelf.querySelectorAll("span")).some((span) =>
        (span.textContent || "").toLowerCase().includes("shorts")
      );
      if (!hasShortsHeader) return;
      if (!(shelf instanceof Element) || !shelf.isConnected || processed.has(shelf) || isUnsafeRoot(shelf)) return;
      processed.add(shelf);
      shelf.remove();
      removed += 1;
    });

    return removed;
  }

  function collectDirectTargets(settings: any): Set<Element> {
    const targets = new Set<Element>();

    // Remove Shorts shelf components directly.
    document.querySelectorAll("ytd-reel-shelf-renderer, ytd-shorts-lockup-view-model, ytm-shorts-lockup-view-model, ytm-shorts-lockup-view-model-v2, ytd-reel-video-renderer").forEach((el) => {
      const container = getGeneralContainer(el as Element);
      maybeRemove(container, targets);
    });

    // Remove cards/lockups that explicitly link to /shorts/.
    document.querySelectorAll("a[href*='/shorts/']").forEach((link) => {
      const container =
        (link as Element).closest(
          "ytd-video-renderer, ytd-grid-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-watch-card-compact-video-renderer, yt-lockup-view-model, ytd-notification-renderer, ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer"
        ) || getGeneralContainer(link as Element);
      maybeRemove(container as Element | null, targets);
    });

    // Remove sidebar guide Shorts entries.
    document.querySelectorAll("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer").forEach((entry) => {
      const endpoint = entry.querySelector("a#endpoint");
      const titleText = entry.querySelector("yt-formatted-string.title")?.textContent;
      const endpointTitle = endpoint?.getAttribute("title");
      const endpointAria = endpoint?.getAttribute("aria-label");
      if (
        (endpoint?.getAttribute("href") || "").includes("/shorts") ||
        isShortsText(titleText) ||
        isShortsText(endpointTitle) ||
        isShortsText(endpointAria)
      ) {
        maybeRemove(entry as Element, targets);
      }
    });

    // Remove Shorts top tabs.
    document.querySelectorAll("yt-tab-shape").forEach((tab) => {
      const text = tab.querySelector(".yt-tab-shape-wiz__tab")?.textContent;
      if (isShortsText(text)) {
        maybeRemove(tab as Element, targets);
      }
    });

    // Optional: notifications only when enabled.
    if (settings?.removeNotifications) {
      document.querySelectorAll("ytd-notification-renderer").forEach((card) => {
        const hasShortsLink = card.querySelector("a[href*='/shorts/']");
        const text = card.textContent || "";
        if (hasShortsLink || /\bshorts\b/i.test(text)) {
          maybeRemove(card as Element, targets);
        }
      });
    }

    return targets;
  }

  function removeCandidates(candidates: Iterable<Element>, settings?: any): number {
    let removed = removeSearchShortsContainers();
    const targets = collectDirectTargets(settings);

    for (const node of candidates) {
      const target = getGeneralContainer(node);
      if (!target || processed.has(target) || !target.isConnected || isUnsafeRoot(target)) continue;
      targets.add(target);
    }

    for (const target of targets) {
      if (processed.has(target) || !target.isConnected || isUnsafeRoot(target)) continue;
      processed.add(target);
      target.remove();
      removed += 1;
    }

    return removed;
  }

  global.EliminateShortsRemover = { removeCandidates };
})(window);
