/**
 * Install Banner Module
 * Handles PWA install prompt with deterministic visibility rules.
 */
class InstallBanner {
  constructor(banner, installButton, dismissButton) {
    this.banner = banner;
    this.installButton = installButton;
    this.dismissButton = dismissButton;
    this.deferredPrompt = null;
    this.installedKey = 'dbc-pwa-installed';
    this.dismissedKey = 'dbc-install-dismissed';

    this.init();
  }

  static isStandalone() {
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

    if (InstallBanner.isStandalone()) {
      this.markInstalled();
      this.hide();
      return;
    }

    if (this.wasInstalled() || this.isInstallDismissed()) {
      this.hide();
      return;
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      if (this.shouldHideBanner()) {
        this.hide();
        return;
      }

      event.preventDefault();
      this.deferredPrompt = event;
      this.show();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.markInstalled();
      this.hide();
    });

    if (this.installButton) {
      this.installButton.addEventListener('click', () => this.install());
    }

    if (this.dismissButton) {
      this.dismissButton.addEventListener('click', () => this.dismiss());
    }
  }

  show() {
    if (this.banner && !this.shouldHideBanner()) {
      this.banner.hidden = false;
      this.banner.classList.add('active');
    }
  }

  hide() {
    if (this.banner) {
      this.banner.hidden = true;
      this.banner.classList.remove('active');
    }
  }

  async install() {
    if (!this.deferredPrompt) {
      // Only prompt install from real deferred event.
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

  markInstalled() {
    localStorage.setItem(this.installedKey, '1');
  }

  wasInstalled() {
    return localStorage.getItem(this.installedKey) === '1';
  }

  isInstallDismissed() {
    return localStorage.getItem(this.dismissedKey) === '1';
  }

  shouldHideBanner() {
    return InstallBanner.isStandalone() || this.wasInstalled() || this.isInstallDismissed();
  }
}
