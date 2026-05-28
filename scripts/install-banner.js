/**
 * Install Banner Module
 * Handles PWA install prompt with dismiss persistence.
 */
class InstallBanner {
  constructor(banner, installButton, dismissButton) {
    this.banner = banner;
    this.installButton = installButton;
    this.dismissButton = dismissButton;
    this.deferredPrompt = null;
    this.storageKey = 'dbc-install-banner-dismissed';

    this.init();
  }

  static isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  init() {
    if (!this.banner || InstallBanner.isStandalone()) {
      return;
    }

    if (localStorage.getItem(this.storageKey) === '1') {
      return;
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.show();
    });

    if (this.installButton) {
      this.installButton.addEventListener('click', () => this.install());
    }

    if (this.dismissButton) {
      this.dismissButton.addEventListener('click', () => this.dismiss());
    }
  }

  show() {
    if (this.banner) {
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
      return;
    }

    this.deferredPrompt.prompt();
    await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.dismiss();
  }

  dismiss() {
    localStorage.setItem(this.storageKey, '1');
    this.hide();
  }
}
