/**
 * Install Banner Module
 * Deterministic install banner flow for PWA-capable browsers.
 */
class InstallBanner {
  constructor(banner, installButton, dismissButton) {
    this.banner = banner;
    this.installButton = installButton;
    this.dismissButton = dismissButton;
    this.titleElement = document.getElementById('installTitle');
    this.descriptionElement = document.getElementById('installDescription');
    this.deferredPrompt = null;
    this.dismissedKey = 'dbc-install-dismissed';
    this.installedKey = 'dbc-pwa-installed';

    this.init();
  }

  static isStandaloneMode() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  init() {
    if (!this.banner) {
      return;
    }

    this.hide();

    if (InstallBanner.isStandaloneMode()) {
      this.markInstalled();
      return;
    }

    if (this.wasInstalled() || this.isDismissed()) {
      return;
    }

    if (this.installButton) {
      this.installButton.addEventListener('click', () => this.handleInstall());
    }

    if (this.dismissButton) {
      this.dismissButton.addEventListener('click', () => this.dismiss());
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      if (this.wasInstalled() || this.isDismissed() || InstallBanner.isStandaloneMode()) {
        this.hide();
        return;
      }

      event.preventDefault();
      this.deferredPrompt = event;
      this.setDefaultCopy();
      this.show();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.markInstalled();
      this.hide();
    });

    const displayModeMedia = window.matchMedia('(display-mode: standalone)');
    displayModeMedia.addEventListener('change', (event) => {
      if (event.matches) {
        this.markInstalled();
        this.hide();
      }
    });

    this.setDefaultCopy();
    this.show();
  }

  show() {
    if (!this.banner || this.wasInstalled() || this.isDismissed() || InstallBanner.isStandaloneMode()) {
      return;
    }

    this.banner.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.banner.classList.add('active'));
    });
  }

  hide() {
    if (!this.banner) {
      return;
    }

    this.banner.classList.remove('active');
    window.setTimeout(() => {
      if (!this.banner.classList.contains('active')) {
        this.banner.hidden = true;
      }
    }, 260);
  }

  async handleInstall() {
    if (!this.deferredPrompt) {
      if (this.descriptionElement) {
        this.descriptionElement.textContent =
          'Use browser menu > Add to Home screen if Install prompt is not available yet.';
      }
      this.show();
      return;
    }

    this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;

    if (choice.outcome === 'accepted') {
      this.markInstalled();
      this.hide();
    } else {
      this.hide();
    }
  }

  dismiss() {
    localStorage.setItem(this.dismissedKey, '1');
    this.deferredPrompt = null;
    this.hide();
  }

  setDefaultCopy() {
    if (this.titleElement) {
      this.titleElement.textContent = 'Add to Home Screen';
    }
    if (this.descriptionElement) {
      this.descriptionElement.textContent = 'Install this card for quick access';
    }
  }

  markInstalled() {
    localStorage.setItem(this.installedKey, '1');
  }

  wasInstalled() {
    return localStorage.getItem(this.installedKey) === '1';
  }

  isDismissed() {
    return localStorage.getItem(this.dismissedKey) === '1';
  }
}
