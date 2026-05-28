/**
 * Main Application Entry Point
 * Initializes and coordinates all application modules.
 */
document.addEventListener('DOMContentLoaded', async function() {
  const bindSocialLinkBlur = () => {
    const socialLinks = document.querySelectorAll('.social-btn[href], .contact-side-btn[href]');
    socialLinks.forEach((link) => {
      link.addEventListener('click', function() {
        window.setTimeout(() => {
          this.blur();
        }, 100);
      });
    });
  };

  const bindActionBlur = () => {
    const actionable = document.querySelectorAll(
      '.social-btn, .copy-btn, .contact-side-btn, .modal-close, .download-btn, .video-avatar-btn, .install-btn'
    );

    actionable.forEach((el) => {
      if (el.dataset.blurBound === '1') {
        return;
      }

      const clearState = () => {
        window.setTimeout(() => {
          if (typeof el.blur === 'function') {
            el.blur();
          }
        }, 0);
      };

      el.addEventListener('pointerup', clearState, { passive: true });
      el.addEventListener('click', clearState, { passive: true });
      el.addEventListener('touchend', clearState, { passive: true });
      el.dataset.blurBound = '1';
    });
  };

  const liveRegion = document.getElementById('liveRegion');
  const announce = (message) => {
    if (liveRegion && message) {
      liveRegion.textContent = '';
      window.setTimeout(() => {
        liveRegion.textContent = message;
      }, 10);
    }
  };

  let cardData = null;
  let labels = {};
  let currentLang = localStorage.getItem('dbc-lang') || 'en';

  try {
    cardData = await CardRenderer.load();
    labels = await CardRenderer.loadLabels(currentLang);
    CardRenderer.apply(cardData, labels, currentLang);
  } catch (error) {
    console.error('Card data load failed; using static HTML fallback.', error);
  }

  const elements = {
    qrModal: document.getElementById('qrModal'),
    showQRButton: document.getElementById('showQR'),
    closeModalButton: document.getElementById('closeModal'),
    qrContainer: document.getElementById('qrCode'),
    downloadQRButton: document.getElementById('downloadQR'),
    saveContactButton: document.getElementById('saveContact'),
    shareCardButton: document.getElementById('shareCard'),
    installBanner: document.getElementById('installBanner'),
    installAction: document.getElementById('installAction'),
    installDismiss: document.getElementById('installDismiss'),
    themeToggle: document.getElementById('themeToggle'),
    langToggle: document.getElementById('langToggle'),
    openVideoButton: document.getElementById('openVideo'),
    videoModal: document.getElementById('videoModal'),
    closeVideoModalButton: document.getElementById('closeVideoModal'),
    profileVideo: document.getElementById('profileVideo'),
    profileVideoSource: document.getElementById('profileVideoSource')
  };

  const qrConfig = cardData?.qr || {
    image: 'assets/MYQR.png',
    downloadFilename: 'omar-khaled-qrcode.png'
  };

  const qrHandler = new QRHandler(
    elements.qrContainer,
    elements.downloadQRButton,
    qrConfig
  );

  const modalHandler = new ModalHandler(
    elements.qrModal,
    elements.showQRButton,
    elements.closeModalButton,
    () => qrHandler.generate()
  );

  const copyHandler = new CopyHandler(1000, announce, labels);

  let vcardHandler = null;
  if (cardData && elements.saveContactButton) {
    vcardHandler = new VCardHandler(elements.saveContactButton, cardData, labels, announce);
  }

  let shareHandler = null;
  if (cardData && elements.shareCardButton) {
    shareHandler = new ShareHandler(elements.shareCardButton, cardData, labels, announce);
  }

  new InstallBanner(
    elements.installBanner,
    elements.installAction,
    elements.installDismiss
  );

  const themeHandler = new ThemeHandler(
    elements.themeToggle,
    document.querySelector('meta[name="theme-color"]'),
    cardData
  );
  themeHandler.init();

  const videoHandler = new VideoHandler(
    elements.openVideoButton,
    elements.videoModal,
    elements.closeVideoModalButton,
    elements.profileVideo,
    elements.profileVideoSource,
    cardData,
    labels
  );
  videoHandler.init();
  videoHandler.setLabels(labels, currentLang);

  if (cardData) {
    const languageHandler = new LanguageHandler(elements.langToggle, cardData, (nextLabels, lang) => {
      labels = nextLabels;
      currentLang = lang;
      copyHandler.labels = nextLabels;
      videoHandler.setLabels(nextLabels, lang);
      if (vcardHandler) {
        vcardHandler.setLabels(nextLabels);
      }
      if (shareHandler) {
        shareHandler.setLabels(nextLabels);
      }
      bindSocialLinkBlur();
      bindActionBlur();
    });
    languageHandler.init();
  }

  bindSocialLinkBlur();
  bindActionBlur();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  }

  console.log('Digital Business Card application initialized successfully');
});

window.addEventListener('focus', function() {
  const focusedContact = document.querySelector('.contact-item-main:focus, .contact-item:focus');
  if (focusedContact) {
    focusedContact.blur();
  }

  document.body.classList.add('disable-hover');
  window.setTimeout(() => {
    document.body.classList.remove('disable-hover');
  }, 200);
});

window.addEventListener('error', function(event) {
  console.error('Application error:', event.error);
});
