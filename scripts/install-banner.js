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
    this.descriptionElement = document.getElementById('installDescription');

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
      this.hide();
      return;
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.show();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.hide();
    });

    if (this.installButton) {
      this.installButton.addEventListener('click', () => this.install());
    }

    if (this.dismissButton) {
      this.dismissButton.addEventListener('click', () => this.dismiss());
    }

    // Show for non-installed users on every visit/reload.
    this.show();
    this.applyPlatformHint();
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
      this.applyPlatformHint();
      return;
    }

    this.deferredPrompt.prompt();
    await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.dismiss();
  }

  dismiss() {
    // Session-only dismiss; banner returns next visit if not installed.
    this.hide();
  }

  applyPlatformHint() {
    if (!this.descriptionElement || this.deferredPrompt) {
      return;
    }

    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

    if (isIOS && isSafari && !InstallBanner.isStandalone()) {
      this.descriptionElement.textContent = 'On iPhone: tap Share, then Add to Home Screen.';
    }
  }
}
