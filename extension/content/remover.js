(function initRemover(global) {
  const processed = new WeakSet();

  function getContainer(node) {
    if (!(node instanceof Element)) return null;

    const candidate = node.closest(
      "ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ytd-rich-section-renderer, ytd-rich-shelf-renderer, ytd-reel-shelf-renderer, ytd-notification-renderer, ytd-item-section-renderer"
    ) || node;

    if (
      candidate === document.body ||
      candidate === document.documentElement ||
      candidate.id === "content" ||
      candidate.id === "page-manager" ||
      candidate.tagName === "YTD-APP"
    ) {
      return null;
    }

    return candidate;
  }

  function removeCandidates(candidates) {
    let removed = 0;

    for (const node of candidates) {
      if (!(node instanceof Element)) continue;
      const target = getContainer(node);
      if (!target || processed.has(target) || !target.isConnected) continue;

      processed.add(target);
      target.remove();
      removed += 1;
    }

    return removed;
  }

  global.EliminateShortsRemover = {
    removeCandidates
  };
})(window);
