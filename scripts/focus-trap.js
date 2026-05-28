/**
 * Focus Trap Utility
 * Traps keyboard focus within a container for accessible modals.
 */
class FocusTrap {
  constructor(container) {
    this.container = container;
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.previousFocus = null;
  }

  getFocusableElements() {
    return Array.from(
      this.container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
  }

  activate() {
    this.previousFocus = document.activeElement;
    document.addEventListener('keydown', this.handleKeyDown);

    const focusable = this.getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      this.container.setAttribute('tabindex', '-1');
      this.container.focus();
    }
  }

  deactivate() {
    document.removeEventListener('keydown', this.handleKeyDown);

    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }

    this.previousFocus = null;
  }

  handleKeyDown(event) {
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = this.getFocusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
