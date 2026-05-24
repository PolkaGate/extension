(() => {
  const hashPath = (window.location.hash || '#/').replace(/^#/, '');
  const fullscreenHashes = [
    '/historyfs',
    '/settingsfs',
    '/accountfs',
    '/fullscreen-stake',
    '/proxyManagement',
    '/send',
    '/nft',
    '/account/',
    '/import/add-watch-only-full-screen',
    '/import/attach-qr-full-screen',
    '/forgot-password',
    '/reset-wallet',
    '/onboarding',
    '/migratePasswords'
  ];

  const matchesFullscreenHash = fullscreenHashes.some((prefix) =>
    hashPath === prefix || hashPath.indexOf(prefix + '/') === 0 || hashPath.indexOf(prefix) === 0
  );

  let isPopupView = false;

  try {
    if (chrome?.extension?.getViews) {
      isPopupView = chrome.extension.getViews({ type: 'popup' }).includes(window);
    }
  } catch (error) {
    isPopupView = false;
  }

  const isFullscreenShell = matchesFullscreenHash || (!isPopupView && window.innerWidth > 357 && window.innerHeight > 621);

  if (isFullscreenShell) {
    document.documentElement.classList.add('fullscreen-shell');
  }
})();
