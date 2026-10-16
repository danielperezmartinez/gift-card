// Applies the saved theme before Angular boots to avoid a light flash in dark mode.
// Lives in its own file (not inline) so the Content-Security-Policy can stay
// at script-src 'self'.
(function () {
  try {
    var stored = localStorage.getItem('gift_card_theme');
    var isDark =
      stored !== null
        ? JSON.parse(stored)
        : window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.style.colorScheme = 'light';
    }
  } catch {
    // Unreadable stored theme: keep the light default.
  }
})();
