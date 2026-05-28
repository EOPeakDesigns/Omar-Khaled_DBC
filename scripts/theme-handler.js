/**
 * Theme Handler Module
 * Syncs system theme and manual toggle with persistence.
 */
class ThemeHandler {
  constructor(toggleButton, metaThemeColor, cardData = null) {
    this.toggleButton = toggleButton;
    this.metaThemeColor = metaThemeColor || document.querySelector('meta[name="theme-color"]');
    this.cardData = cardData;
    this.storageKey = 'dbc-theme';
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }

  init() {
    const saved = localStorage.getItem(this.storageKey);
    const theme = saved || (this.mediaQuery.matches ? 'dark' : 'light');
    this.applyTheme(theme);

    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => this.toggleTheme());
    }

    this.mediaQuery.addEventListener('change', (event) => {
      const manual = localStorage.getItem(this.storageKey);
      if (manual) {
        return;
      }
      this.applyTheme(event.matches ? 'dark' : 'light');
    });
  }

  toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.storageKey, next);
    this.applyTheme(next);
  }

  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);

    if (this.toggleButton) {
      const icon = this.toggleButton.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }

    if (this.metaThemeColor) {
      const color = theme === 'dark' ? '#1f1f1f' : (this.cardData?.meta?.themeColor || '#FFC107');
      this.metaThemeColor.setAttribute('content', color);
    }
  }
}
