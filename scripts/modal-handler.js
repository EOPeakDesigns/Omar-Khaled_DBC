/**
 * Modal Handler Module
 * Manages modal interactions including open, close, backdrop click, and focus trap.
 */
class ModalHandler {
  constructor(modalElement, openButton, closeButton, onOpen = null) {
    this.modal = modalElement;
    this.openButton = openButton;
    this.closeButton = closeButton;
    this.onOpenCallback = onOpen;
    this.focusTrap = new FocusTrap(this.modal);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.initEventListeners();
  }

  initEventListeners() {
    this.openButton.addEventListener('click', () => this.open());
    this.closeButton.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => this.handleBackdropClick(e));
  }

  open() {
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');

    if (this.onOpenCallback && typeof this.onOpenCallback === 'function') {
      this.onOpenCallback();
    }

    document.addEventListener('keydown', this.handleKeyDown);
    document.body.classList.add('modal-open');
    this.focusTrap.activate();
  }

  close() {
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', this.handleKeyDown);
    document.body.classList.remove('modal-open');
    this.focusTrap.deactivate();

    if (this.openButton) {
      this.openButton.focus();
      window.setTimeout(() => {
        this.openButton.blur();
      }, 0);
    }
  }

  handleBackdropClick(event) {
    if (event.target === this.modal) {
      this.close();
    }
  }

  handleKeyDown(event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      this.close();
    }
  }
}
