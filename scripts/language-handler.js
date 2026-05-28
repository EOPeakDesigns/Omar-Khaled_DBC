/**
 * Language Handler Module
 * Switches EN/AR labels and direction with persistence.
 */
class LanguageHandler {
  constructor(toggleButton, cardData, onLanguageChange = null) {
    this.toggleButton = toggleButton;
    this.cardData = cardData;
    this.onLanguageChange = onLanguageChange;
    this.storageKey = 'dbc-lang';
    this.currentLang = localStorage.getItem(this.storageKey) || 'en';
  }

  async init() {
    await this.apply(this.currentLang);

    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', async () => {
        const next = this.currentLang === 'en' ? 'ar' : 'en';
        await this.apply(next);
      });
    }
  }

  async apply(lang) {
    const labels = await CardRenderer.loadLabels(lang);
    this.currentLang = lang;
    localStorage.setItem(this.storageKey, lang);

    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.body.setAttribute('dir', dir);

    if (this.toggleButton) {
      this.toggleButton.textContent = lang === 'en' ? 'AR' : 'EN';
    }

    CardRenderer.apply(this.cardData, labels, lang);

    if (typeof this.onLanguageChange === 'function') {
      this.onLanguageChange(labels, lang);
    }
  }
}
