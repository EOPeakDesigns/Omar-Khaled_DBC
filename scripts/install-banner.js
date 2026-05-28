/**
 * Install Banner Module
 * Smart install banner flow with session-only dismiss.
 */
class InstallBanner {
  constructor(banner, installButton, dismissButton) {
    this.banner = banner;
    this.installButton = installButton;
    this.dismissButton = dismissButton;
    this.titleElement = document.getElementById('installTitle');
    this.descriptionElement = document.getElementById('installDescription');
    this.deferredPrompt = null;
    this.dismissedForCurrentView = false;

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

    if (this.isInstalledEnvironment()) {
      return;
    }

    if (this.installButton) {
      this.installButton.addEventListener('click', () => this.handleInstall());
    }

    if (this.dismissButton) {
      this.dismissButton.addEventListener('click', () => this.dismiss());
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      if (this.isInstalledEnvironment() || this.dismissedForCurrentView) {
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
      this.hide();
    });

    const displayModeMedia = window.matchMedia('(display-mode: standalone)');
    displayModeMedia.addEventListener('change', (event) => {
      if (event.matches) {
        this.hide();
      }
    });

    // Show for non-installed users. If prompt arrives later, it replaces fallback.
    this.setDefaultCopy();
    this.show();
  }

  show() {
    if (!this.banner || this.isInstalledEnvironment() || this.dismissedForCurrentView) {
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
    if (this.isInstalledEnvironment()) {
      this.hide();
      return;
    }

    if (!this.deferredPrompt) {
      if (this.descriptionElement) {
        this.descriptionElement.textContent =
          'This card is either already installed on your device or installation is not supported on your current device.';
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
    // Dismiss only for current view; reappears after reload.
    this.dismissedForCurrentView = true;
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

  isInstalledEnvironment() {
    return InstallBanner.isStandaloneMode();
  }
}
