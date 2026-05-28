/**
 * Share Handler Module
 * Uses Web Share API with clipboard fallback.
 */
class ShareHandler {
  constructor(button, cardData, labels = {}, announce = null) {
    this.button = button;
    this.cardData = cardData;
    this.labels = labels;
    this.announce = announce;

    if (this.button) {
      this.button.addEventListener('click', () => this.share());
    }
  }

  setLabels(labels = {}) {
    this.labels = labels;
  }

  getSharePayload() {
    const owner = this.cardData.owner;
    const url = this.cardData.meta?.canonical || window.location.href;

    return {
      title: this.cardData.meta?.title || `${owner.name} - Digital Business Card`,
      text: `${owner.name} - ${owner.title}`,
      url
    };
  }

  async share() {
    const payload = this.getSharePayload();

    try {
      if (navigator.share) {
        await navigator.share(payload);
        if (this.button) {
          this.button.blur();
        }
        return;
      }

      const text = `${payload.text}\n${payload.url}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      if (this.announce) {
        this.announce(this.labels.shareFallback || 'Link copied to clipboard');
      }
    } catch (error) {
      if (error && error.name === 'AbortError') {
        return;
      }
      console.error('Share failed:', error);
    } finally {
      if (this.button) {
        this.button.blur();
      }
    }
  }
}
