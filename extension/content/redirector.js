(function initRedirector(global) {
  function resolveTarget(redirectTarget) {
    if (redirectTarget === "subscriptions") {
      return "https://www.youtube.com/feed/subscriptions";
    }
    return "https://www.youtube.com/";
  }

  async function maybeRedirect() {
    const settings = await global.EliminateShortsStorage.getSettings();
    if (!settings.enabled || !settings.redirectShortsUrls) return;

    if (location.pathname.startsWith("/shorts/")) {
      location.replace(resolveTarget(settings.redirectTarget));
    }
  }

  global.EliminateShortsRedirector = {
    maybeRedirect
  };
})(window);
