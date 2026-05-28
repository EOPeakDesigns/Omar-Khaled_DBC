# Omar Khaled Digital Business Card

Production-ready, mobile-first digital business card with bilingual support, QR/vCard/share utilities, profile video, and installable PWA behavior.

## Overview

This project delivers a premium single-page contact card experience for executive representation:

- Dynamic owner/profile data from `data/card.json`
- EN/AR language switching with RTL support
- Direct call, WhatsApp quick action, email, maps, and website links
- QR modal with download
- vCard generation (`.vcf`) for contact save
- Native share API with clipboard fallback
- Profile video modal
- Dark mode with system sync and manual toggle
- Install prompt support + offline service worker baseline

## Tech Stack

- Semantic HTML5
- Modular CSS (`styles/*.css`)
- Vanilla JavaScript modules by responsibility (`scripts/*.js`)
- PWA: `manifest.webmanifest` + `sw.js`

## Project Structure

```txt
v0/
├─ index.html
├─ manifest.webmanifest
├─ sw.js
├─ data/
│  ├─ card.json
│  └─ labels.json
├─ styles/
│  ├─ main.css
│  ├─ card.css
│  ├─ modal.css
│  └─ responsive.css
├─ scripts/
│  ├─ app.js
│  ├─ card-renderer.js
│  ├─ language-handler.js
│  ├─ theme-handler.js
│  ├─ video-handler.js
│  ├─ modal-handler.js
│  ├─ qr-handler.js
│  ├─ vcard-handler.js
│  ├─ share-handler.js
│  ├─ copy-handler.js
│  └─ focus-trap.js
└─ assets/
```

## Required Assets Before Production Launch

Place these files in `assets/` for final branded output:

- `owner.webp`
- `MYQR.png`
- `bacground7.png`
- `bacground7_dark.png`
- `profile-video.mp4` (optional but recommended)

Fallback SVGs already exist and prevent hard failures if branded files are temporarily missing.

## Local Run

Use a local HTTP server (do not open with `file://`):

```bash
python -m http.server 8080
```

Then open:

```txt
http://localhost:8080
```

## Deploy To GitHub + Vercel

### 1) Push to GitHub

```bash
git init
git add .
git commit -m "Prepare digital business card for production deployment"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2) Deploy on Vercel

1. Go to [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Framework preset: **Other**
4. Build command: *(leave empty)*
5. Output directory: *(leave empty / root)*
6. Deploy

No build step is required for this project.

## Mobile QA Checklist (Release Gate)

- iPhone Safari: 320/375/390 widths
- Android Chrome: 360/412 widths
- QR modal open/close via button, `Esc`, and backdrop
- No sticky focus/hover after tapping action buttons
- Phone row remains one-line and aligned
- Theme toggle works + persists
- Language switch updates labels + RTL alignment
- Video modal opens/closes and video stops on close
- PWA install banner appears correctly and dismiss persists

## Configuration

- Owner/profile/contact/social/meta: `data/card.json`
- Localized labels (EN/AR): `data/labels.json`

## Notes

- Service worker cache is intentionally resilient to missing optional branded assets to avoid install failures.
- For strongest social preview quality, ensure `meta.ogImage` points to a valid public asset.

## License

Proprietary project under EOPeak branding and client ownership.

