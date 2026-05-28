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
    this.titleElement = document.getElementById('installTitle');
    this.installedKey = 'dbc-pwa-installed';
    this.dismissedSessionKey = 'dbc-install-dismissed-session';

    this.init();
  }

  static isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  async init() {
    if (!this.banner || InstallBanner.isStandalone()) {
      this.markInstalled();
      this.hide();
      return;
    }

    this.hide();

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event;

      if (this.shouldStayHidden()) {
        this.hide();
        return;
      }

      this.setNativeInstallMode();
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

    if (this.wasInstalled()) {
      await this.revalidateInstalledState();
    }

    if (this.shouldStayHidden()) {
      this.hide();
      return;
    }

    this.setNativeInstallMode();
    this.applyPlatformHint();
    this.show();
  }

  show() {
    if (this.banner && !this.shouldStayHidden()) {
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
      if (this.descriptionElement && !this.isIOSSafari()) {
        this.descriptionElement.textContent = 'If install does not start, use your browser menu and choose Install app or Add to Home Screen.';
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
      this.setNativeInstallMode();
      this.show();
    }
  }

  dismiss() {
    // Hide for the current browser session.
    sessionStorage.setItem(this.dismissedSessionKey, '1');
    this.hide();
  }

  applyPlatformHint() {
    if (!this.descriptionElement || this.deferredPrompt) {
      return;
    }

    if (this.isIOSSafari() && !InstallBanner.isStandalone()) {
      this.setManualInstallMode('On iPhone: tap Share, then Add to Home Screen.');
    }
  }

  setNativeInstallMode() {
    if (this.titleElement) {
      this.titleElement.textContent = 'Add to Home Screen';
    }
    if (this.descriptionElement) {
      this.descriptionElement.textContent = 'Install this card for quick access';
    }
    if (this.installButton) {
      this.installButton.hidden = false;
      this.installButton.disabled = false;
      this.installButton.textContent = 'Install';
      this.installButton.setAttribute('aria-disabled', 'false');
    }
  }

  setManualInstallMode(message = 'Use your browser menu to add this card to your Home Screen.') {
    if (this.titleElement) {
      this.titleElement.textContent = 'Add to Home Screen';
    }
    if (this.descriptionElement) {
      this.descriptionElement.textContent = message;
    }
    if (this.installButton) {
      this.installButton.hidden = false;
      this.installButton.disabled = false;
      this.installButton.textContent = 'Install';
      this.installButton.setAttribute('aria-disabled', 'false');
    }
  }

  markInstalled() {
    localStorage.setItem(this.installedKey, '1');
  }

  wasInstalled() {
    return localStorage.getItem(this.installedKey) === '1';
  }

  isDismissedInSession() {
    return sessionStorage.getItem(this.dismissedSessionKey) === '1';
  }

  shouldStayHidden() {
    return InstallBanner.isStandalone() || this.wasInstalled() || this.isDismissedInSession();
  }

  async revalidateInstalledState() {
    if (typeof navigator.getInstalledRelatedApps !== 'function') {
      return;
    }

    try {
      const relatedApps = await navigator.getInstalledRelatedApps();
      if (Array.isArray(relatedApps) && relatedApps.length === 0) {
        localStorage.removeItem(this.installedKey);
      }
    } catch (error) {
      // Keep the stored installed state when browser support is partial.
    }
  }

  isIOSSafari() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
    return isIOS && isSafari;
  }
}
