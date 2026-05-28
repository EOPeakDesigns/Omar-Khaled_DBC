/**
 * Card Renderer Module
 * Loads owner data from card.json and applies it to the DOM.
 */
class CardRenderer {
  static async load() {
    const response = await fetch('data/card.json');
    if (!response.ok) {
      throw new Error('Failed to load card.json');
    }
    return response.json();
  }

  static async loadLabels(lang = 'en') {
    const response = await fetch('data/labels.json');
    if (!response.ok) {
      return {};
    }
    const labels = await response.json();
    return labels[lang] || labels.en || {};
  }

  static apply(card, labels = {}, lang = 'en') {
    const isArabic = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.body.setAttribute('dir', isArabic ? 'rtl' : 'ltr');

    const title = card.meta?.title || `${card.owner.name} - Digital Business Card`;
    document.title = title;

    this.setMeta('description', card.meta?.description || '');
    this.setMeta('author', card.meta?.author || '');
    this.setMeta('theme-color', card.meta?.themeColor || '#FFC107');
    this.setLink('canonical', card.meta?.canonical || window.location.href);

    this.setMetaProperty('og:title', title);
    this.setMetaProperty('og:description', card.meta?.description || '');
    this.setMetaProperty('og:url', card.meta?.canonical || window.location.href);
    this.setMetaProperty('og:image', this.resolveUrl(card.meta?.ogImage || card.owner.image));
    this.setMetaProperty('og:type', 'website');
    this.setMetaName('twitter:card', 'summary_large_image');
    this.setMetaName('twitter:title', title);
    this.setMetaName('twitter:description', card.meta?.description || '');
    this.setMetaName('twitter:image', this.resolveUrl(card.meta?.ogImage || card.owner.image));

    const profileImg = document.querySelector('.profile-image img');
    if (profileImg) {
      profileImg.src = card.owner.image;
      profileImg.alt = card.owner.imageAlt || `${card.owner.name} profile photo`;
      profileImg.onerror = () => {
        profileImg.src = CardRenderer.createOwnerFallback(card.owner.initials || 'GM');
      };
    }

    const nameEl = document.querySelector('.name');
    if (nameEl) {
      nameEl.textContent = isArabic && card.owner.nameAr ? card.owner.nameAr : card.owner.name;
    }

    const positionEl = document.querySelector('.position');
    if (positionEl) {
      positionEl.textContent = isArabic && card.owner.titleAr ? card.owner.titleAr : card.owner.title;
    }

    this.updateContactItem('phone', {
      href: `tel:${card.contact.phone}`,
      text: card.contact.phoneDisplay,
      copy: card.contact.phoneDisplay,
      aria: labels.callAria || 'Call phone number',
      sideHref: `https://wa.me/${card.contact.whatsapp}`,
      sideAria: labels.whatsappQuickAria || 'Open WhatsApp chat'
    });

    this.updateContactItem('email', {
      href: `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(card.contact.email)}`,
      text: card.contact.email,
      copy: card.contact.email,
      aria: labels.emailAria || 'Send email'
    });

    this.updateContactItem('address', {
      href: card.contact.mapsUrl,
      text: isArabic && card.contact.addressAr ? card.contact.addressAr : card.contact.address,
      aria: labels.mapsAria || 'Open address in maps'
    });

    this.updateContactItem('website', {
      href: card.contact.website,
      text: card.contact.websiteDisplay || card.contact.website.replace(/^https?:\/\//, ''),
      aria: labels.websiteAria || 'Visit website'
    });

    this.renderSocialLinks(card.social || []);
    this.applyLabels(labels, lang);
  }

  static applyLabels(labels, lang = 'en') {
    const mappings = [
      ['#modalTitle', 'modalTitle'],
      ['#modalDescription', 'modalDescription'],
      ['#closeModal', 'closeModalAria', 'aria-label'],
      ['#showQR', 'showQrAria', 'aria-label'],
      ['#saveContact', 'saveContactAria', 'aria-label'],
      ['#shareCard', 'shareAria', 'aria-label'],
      ['#downloadQR', 'downloadQr', 'textContent'],
      ['#installTitle', 'installTitle'],
      ['#installDescription', 'installDescription'],
      ['#installAction', 'installAction'],
      ['#installDismiss', 'installDismiss'],
      ['#skipLink', 'skipLink', 'textContent']
    ];

    mappings.forEach(([selector, key, attr = 'textContent']) => {
      const el = document.querySelector(selector);
      if (el && labels[key]) {
        if (attr === 'textContent') {
          el.textContent = labels[key];
        } else {
          el.setAttribute(attr, labels[key]);
        }
      }
    });

    const phoneCopy = document.querySelector('[data-contact="phone"] .copy-btn');
    if (phoneCopy && labels.copyPhoneAria) {
      phoneCopy.setAttribute('aria-label', labels.copyPhoneAria);
    }

    const emailCopy = document.querySelector('[data-contact="email"] .copy-btn');
    if (emailCopy && labels.copyEmailAria) {
      emailCopy.setAttribute('aria-label', labels.copyEmailAria);
    }

    const phoneQuick = document.querySelector('[data-contact="phone"] .contact-side-btn');
    if (phoneQuick && labels.whatsappQuickAria) {
      phoneQuick.setAttribute('aria-label', labels.whatsappQuickAria);
    }

    const phoneMain = document.querySelector('[data-contact="phone"] .contact-item-main');
    if (phoneMain && labels.callAria) {
      phoneMain.setAttribute('aria-label', labels.callAria);
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle && labels.themeToggleAria) {
      themeToggle.setAttribute('aria-label', labels.themeToggleAria);
    }

    const langToggle = document.getElementById('langToggle');
    if (langToggle && labels.langToggleAria) {
      langToggle.setAttribute('aria-label', labels.langToggleAria);
      langToggle.textContent = lang === 'en' ? 'AR' : 'EN';
    }

    const videoOpen = document.getElementById('openVideo');
    if (videoOpen && labels.videoOpenAria) {
      videoOpen.setAttribute('aria-label', labels.videoOpenAria);
    }

    const closeVideo = document.getElementById('closeVideoModal');
    if (closeVideo && labels.closeVideoAria) {
      closeVideo.setAttribute('aria-label', labels.closeVideoAria);
    }

    const videoTitle = document.getElementById('videoTitle');
    if (videoTitle && labels.videoTitle) {
      videoTitle.textContent = labels.videoTitle;
    }

    const videoDescription = document.getElementById('videoDescription');
    if (videoDescription && labels.videoDescription) {
      videoDescription.textContent = labels.videoDescription;
    }
  }

  static updateContactItem(key, data) {
    const item = document.querySelector(`[data-contact="${key}"]`);
    if (!item) {
      return;
    }

    const link = item.querySelector('.contact-item-main') || item;
    const text = item.querySelector('.contact-text');

    if (text && data.text) {
      text.textContent = data.text;
    }

    if (link.tagName === 'A' || link.classList.contains('contact-item-main')) {
      if (data.href) {
        link.href = data.href;
      }
      if (data.aria) {
        link.setAttribute('aria-label', data.aria);
      }
      if (data.telHref) {
        link.setAttribute('data-tel-href', data.telHref);
      }
    }

    const sideBtn = item.querySelector('.contact-side-btn');
    if (sideBtn && data.sideHref) {
      sideBtn.href = data.sideHref;
    }
    if (sideBtn && data.sideAria) {
      sideBtn.setAttribute('aria-label', data.sideAria);
    }

    const copyBtn = item.querySelector('.copy-btn');
    if (copyBtn && data.copy) {
      copyBtn.setAttribute('data-copy', data.copy);
    }
  }

  static renderSocialLinks(socialLinks) {
    const container = document.getElementById('socialLinks');
    if (!container) {
      return;
    }

    container.innerHTML = '';

    socialLinks.forEach((social) => {
      const link = document.createElement('a');
      link.href = social.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'social-btn';
      link.setAttribute('aria-label', social.label);
      link.innerHTML = `<i class="${social.icon}" aria-hidden="true"></i>`;
      container.appendChild(link);
    });
  }

  static setMeta(name, content) {
    if (!content) {
      return;
    }
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  static setMetaProperty(property, content) {
    if (!content) {
      return;
    }
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  static setMetaName(name, content) {
    if (!content) {
      return;
    }
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  static setLink(rel, href) {
    if (!href) {
      return;
    }
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  static resolveUrl(path) {
    try {
      return new URL(path, window.location.href).href;
    } catch (error) {
      return path;
    }
  }

  static createOwnerFallback(initials) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#FFC107"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="118" font-family="Montserrat, Arial, sans-serif" fill="#ffffff" font-weight="700">${initials}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
}
