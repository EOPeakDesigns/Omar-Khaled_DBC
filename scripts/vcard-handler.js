/**
 * vCard Handler Module
 * Generates and downloads a .vcf contact file from card data.
 */
class VCardHandler {
  constructor(button, cardData, labels = {}, announce = null) {
    this.button = button;
    this.cardData = cardData;
    this.labels = labels;
    this.announce = announce;
    this.filename = 'contact.vcf';

    if (this.button) {
      this.button.addEventListener('click', () => this.download());
    }
  }

  setLabels(labels = {}) {
    this.labels = labels;
  }

  escapeVCardValue(value) {
    return String(value)
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }

  buildVCard() {
    const owner = this.cardData.owner;
    const contact = this.cardData.contact;

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${this.escapeVCardValue(owner.name)}`,
      `N:${this.escapeVCardValue(owner.name)};;;;`,
      `TITLE:${this.escapeVCardValue(owner.title)}`,
      `TEL;TYPE=CELL:${this.escapeVCardValue(contact.phone)}`,
      `EMAIL;TYPE=INTERNET:${this.escapeVCardValue(contact.email)}`,
      `ADR;TYPE=WORK:;;${this.escapeVCardValue(contact.address)};;;;`,
      `URL:${this.escapeVCardValue(contact.website)}`,
      'END:VCARD'
    ];

    return lines.join('\r\n');
  }

  download() {
    try {
      const vcard = this.buildVCard();
      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = this.cardData.owner.name.toLowerCase().replace(/\s+/g, '-');

      link.href = url;
      link.download = `${safeName}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (this.announce) {
        this.announce(this.labels.vcardSuccess || 'Contact file ready');
      }

      if (this.button) {
        this.button.blur();
      }
    } catch (error) {
      console.error('vCard download failed:', error);
      if (this.announce) {
        this.announce(this.labels.vcardError || 'Could not create contact file');
      }
    }
  }
}
