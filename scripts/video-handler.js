/**
 * Video Handler Module
 * Handles avatar video modal open/close and YouTube embed lifecycle.
 */
class VideoHandler {
  constructor(openButton, modalElement, closeButton, videoElement, sourceElement, cardData, labels = {}) {
    this.openButton = openButton;
    this.modal = modalElement;
    this.closeButton = closeButton;
    this.video = videoElement;
    this.source = sourceElement;
    this.cardData = cardData;
    this.labels = labels;
    this.focusTrap = this.modal ? new FocusTrap(this.modal) : null;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.embedUrl =
      (this.video && this.video.getAttribute('data-src')) ||
      'https://www.youtube.com/embed/2Ri8f-wqonE?playsinline=1&rel=0&modestbranding=1';
  }

  init() {
    if (!this.openButton || !this.modal || !this.closeButton) {
      return;
    }

    this.openButton.addEventListener('click', () => this.open());
    this.closeButton.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    });

    if (this.source && this.video && this.video.tagName === 'VIDEO' && this.cardData?.owner?.video) {
      this.source.src = this.cardData.owner.video;
      this.video.load();
    }
  }

  setLabels(labels = {}, lang = 'en') {
    this.labels = labels;

    const description = this.modal?.querySelector('#videoDescription');
    const highlights = this.modal?.querySelector('#videoHighlights');
    if (description && labels.videoDescription) {
      description.textContent = labels.videoDescription;
    }
    if (this.openButton && labels.videoOpenAria) {
      this.openButton.setAttribute('aria-label', labels.videoOpenAria);
    }
    if (this.closeButton && labels.closeVideoAria) {
      this.closeButton.setAttribute('aria-label', labels.closeVideoAria);
    }

    if (highlights) {
      const isArabic = lang === 'ar';
      const list = isArabic ? this.cardData?.owner?.specialtiesAr : this.cardData?.owner?.specialties;
      if (Array.isArray(list) && list.length > 0) {
        highlights.innerHTML = '';
        list.slice(0, 4).forEach((item) => {
          const li = document.createElement('li');
          li.className = 'video-highlight-item';
          li.textContent = item;
          highlights.appendChild(li);
        });
      }
    }
  }

  loadEmbed() {
    if (!this.video || this.video.tagName !== 'IFRAME') {
      return;
    }

    const src = this.video.getAttribute('data-src') || this.embedUrl;
    if (!src) {
      return;
    }

    // Load only when modal opens so mobile browsers paint the iframe reliably.
    if (this.video.getAttribute('src') !== src) {
      this.video.setAttribute('src', src);
    }
  }

  unloadEmbed() {
    if (!this.video || this.video.tagName !== 'IFRAME') {
      return;
    }

    this.video.setAttribute('src', '');
  }

  open() {
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    document.addEventListener('keydown', this.handleKeyDown);

    this.loadEmbed();

    if (this.focusTrap) {
      this.focusTrap.activate();
    }
  }

  close() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', this.handleKeyDown);

    if (this.video && this.video.tagName === 'VIDEO') {
      this.video.pause();
      this.video.currentTime = 0;
    } else {
      this.unloadEmbed();
    }

    if (this.focusTrap) {
      this.focusTrap.deactivate();
    }
    if (this.openButton) {
      this.openButton.focus();
    }
  }

  handleKeyDown(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      this.close();
    }
  }
}
