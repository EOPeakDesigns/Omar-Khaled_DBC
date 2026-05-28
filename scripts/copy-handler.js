/**
 * Copy Handler Module
 * Manages copy-to-clipboard functionality with visual and screen reader feedback.
 */
class CopyHandler {
  constructor(resetDelay = 1000, announce = null, labels = {}) {
    this.resetDelay = resetDelay;
    this.announce = announce;
    this.labels = labels;
    this.copyButtons = [];
    this.initCopyButtons();
  }

  initCopyButtons() {
    this.copyButtons = document.querySelectorAll('.copy-btn');

    this.copyButtons.forEach((button) => {
      button.addEventListener('click', (e) => this.handleCopy(e));
    });
  }

  handleCopy(event) {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget;
    const textToCopy = button.getAttribute('data-copy');

    if (!textToCopy) {
      console.warn('No data-copy attribute found on button');
      return;
    }

    this.copyToClipboard(textToCopy, button);
  }

  async copyToClipboard(text, button) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        this.showSuccess(button);
      } else {
        this.fallbackCopy(text, button);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      this.showError(button);
    }
  }

  fallbackCopy(text, button) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    try {
      textarea.select();
      const successful = document.execCommand('copy');

      if (successful) {
        this.showSuccess(button);
      } else {
        this.showError(button);
      }
    } catch (error) {
      console.error('Fallback copy failed:', error);
      this.showError(button);
    } finally {
      document.body.removeChild(textarea);
    }
  }

  showSuccess(button) {
    button.disabled = true;

    const icon = button.querySelector('i');
    const originalClasses = icon.className;

    icon.className = 'fas fa-check';
    button.classList.add('success');

    if (this.announce) {
      this.announce(this.labels.copySuccess || 'Copied to clipboard');
    }

    setTimeout(() => {
      this.resetButton(button, icon, originalClasses);
    }, this.resetDelay);
  }

  showError(button) {
    const icon = button.querySelector('i');
    const originalClasses = icon.className;

    icon.className = 'fas fa-times';

    if (this.announce) {
      this.announce(this.labels.copyError || 'Could not copy');
    }

    setTimeout(() => {
      this.resetButton(button, icon, originalClasses);
    }, this.resetDelay);
  }

  resetButton(button, icon, originalClasses) {
    icon.className = originalClasses;
    button.classList.remove('success');
    button.disabled = false;
  }
}
