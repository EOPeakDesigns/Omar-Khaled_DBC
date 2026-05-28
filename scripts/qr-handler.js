/**
 * QR Code Handler Module
 * Manages QR code display and download functionality.
 */
class QRHandler {
  constructor(containerElement, downloadButton, qrConfig = {}) {
    this.container = containerElement;
    this.downloadButton = downloadButton;
    this.qrImagePath = qrConfig.image || 'assets/MYQR.png';
    this.downloadFilename = qrConfig.downloadFilename || 'qrcode.png';
    this.qrCodeInstance = null;

    this.initDownloadListener();
  }

  generate() {
    this.container.innerHTML = '';

    try {
      const qrImage = document.createElement('img');
      qrImage.src = this.qrImagePath;
      qrImage.alt = 'QR Code for Digital Business Card';
      qrImage.className = 'qr-code-img';
      qrImage.width = 200;
      qrImage.height = 200;
      qrImage.decoding = 'async';
      qrImage.loading = 'lazy';
      qrImage.onerror = () => {
        this.container.innerHTML = '<div class="qr-fallback">QR unavailable</div>';
      };

      this.container.appendChild(qrImage);
      this.qrCodeInstance = qrImage;
    } catch (error) {
      console.error('Error displaying QR code:', error);
    }
  }

  initDownloadListener() {
    this.downloadButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.download();
    });
  }

  download() {
    const qrImage = this.container.querySelector('img');

    if (!qrImage) {
      console.warn('QR code image not found. Generate QR code first.');
      return;
    }

    try {
      const downloadLink = document.createElement('a');
      downloadLink.href = qrImage.src;
      downloadLink.download = this.downloadFilename;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      if (this.downloadButton) {
        this.downloadButton.blur();
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  }
}
