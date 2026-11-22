# Technical Documentation

## Architecture

Static multi-page site. Each page is complete HTML that reads correctly without JavaScript; `main.js` adds interaction on top (progressive enhancement).

| Layer | Files |
|---|---|
| Markup | `index.html`, `projects/*.html`, `cv.html`, `capability-statement.html`, `404.html` |
| Styles | `assets/css/main.css` (tokens, components, sections, print); `assets/css/document.css` (A4 documents) |
| Behaviour | `assets/js/main.js` (one file, no dependencies, ~430 lines) |
| Icons | `assets/img/icons.svg` (sprite, referenced with `<use href="…#i-name">`) |
| Fonts | `assets/fonts/` Archivo (variable weight and width), JetBrains Mono 400 |

The header, footer and `<head>` blocks are repeated in each page. If you change one, change it in every page (search for `site-header` / `site-footer`).

## Design system

Tokens live at the top of `main.css` (section 2):

| Token | Value | Use |
|---|---|---|
| `--ink` | `#06101C` | Page background (SARM navy) |
| `--panel` | `#0E1C2D` | Raised surfaces |
| `--teal` | `#36D1BE` | Primary accent, assurance lens |
| `--cyan` | `#7AD3F5` | Secondary accent, framework references |
| `--coral` | `#F08B8B` | Adversary lens only |
| `--wide` | `118%` | Archivo width for display headings |

Layout idea: a "working-paper" grid. On wide screens each home-page section has a sticky reference column (section number and name) beside the content.

Motion: one load sequence (the portrait and SARM chevrons assembling) plus responses to user actions. Everything is disabled under `prefers-reduced-motion`.

## Components and how to edit them

All filters use one pattern, driven by data attributes:

```html
<div class="chips" data-filter-group="KEY"> <button class="chip" data-filter="all" aria-pressed="true">…</button> … </div>
<p class="filter-status" data-filter-status="KEY" role="status"></p>
<ul data-filter-list="KEY"> <li data-category="cat1 cat2">…</li> </ul>
<div data-filter-empty="KEY" hidden>…<button data-filter-reset="KEY">…</button></div>
```

| Component | KEY | Categories |
|---|---|---|
| Career timeline | `timeline` | `professional`, `research`, `learning` |
| Projects | `projects` | `grc`, `offensive`, `intel`, `academic` |
| Technical arsenal | `tools` (+ search box `data-filter-search="tools"`) | `network`, `web`, `vuln`, `ad`, `redteam`, `wireless`, `intel`, `automation` |
| Credentials | `creds` | `cert`, `training`, `edu`, `recog` |

An item can belong to several categories (space-separated). Search matches the item text plus its `data-keywords`.

**Adding a tool:** copy an existing `<li class="tool">` in section 07, change its text, `data-category` and `data-keywords`, then update the count in the matching chip(s).

**Adding a credential:** copy a `<li class="cred">` in section 09 and set `data-category` and the badge (`type--cert`, `type--training`, `type--edu`, `type--recog`). Only use `cert` for awarded certifications. Update the chip counts.

**Tabs (Dual-Lens explorer and audit methodology):** add a `<div data-tab-panel data-tab-label="Short label" id="unique-id">`. The tab button is created automatically. A panel can be opened directly with `index.html#unique-id`.

**Research section:** to publish an article, move its `<li class="pub pub--planned">` from *In preparation* to *Available now*, remove `pub--planned`, change the badge, and link the title.

### Engagements

Engagements in section 03 and in `cv.html` are anonymised by sector. If you obtain written authorisation to name a client, edit the `<span>` under the relevant item, for example:

```html
<li>ITGC audit and core banking systems assessment<span>Public-sector bank</span></li>
```

Then regenerate the CV PDF (below).

## Contact form

- Endpoint: `https://formspree.io/f/xqabqrrl` (unchanged). Delivery address is configured in Formspree.
- Without JavaScript: a normal POST with browser validation.
- With JavaScript: custom validation, `fetch` with `Accept: application/json`, 15-second timeout, success and error states, `mailto:` fallback, honeypot, minimum 3 seconds on page, 60-second cooldown (stored in `localStorage` when available).
- The subject line is set to `Portfolio enquiry: <topic> from <name>`.
- Settings are at the top of `main.js` in the `SITE` object.

## Regenerating the PDFs

```bash
cd site && python3 -m http.server 8000 &
pip install playwright && python3 -m playwright install chromium
python3 tools/build_pdfs.py
```

This prints `cv.html` and `capability-statement.html` to `site/assets/docs/` as A4 PDFs.

## Security

- Content Security Policy on every page: `default-src 'self'`; scripts, styles, fonts and images from the site only; network requests and form posts only to Formspree; `object-src 'none'`; `base-uri 'self'`.
- No inline scripts or styles (JSON-LD data blocks are not executed and are not affected by CSP).
- External links use `target="_blank" rel="noopener noreferrer"` and announce "opens in a new tab" to screen readers.
- `_headers` adds `frame-ancestors 'none'`, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy` and `COOP` on hosts that support it.
- No cookies, analytics or third-party requests on page load.
- If you add an external script or embed, add its origin to the CSP in every page and in `_headers`, or it will be blocked.

## SEO

- Unique title, description and canonical URL per page.
- Open Graph and Twitter Card tags; new 1200×630 `assets/img/og-image.png`.
- JSON-LD: `Person` and `WebSite` on the home page (with `hasCredential` for the six certifications), `SoftwareSourceCode` on the ISMS page, `BreadcrumbList` on every case study. No `ProfessionalService`, because the site does not present a service business.
- `sitemap.xml` (7 URLs) and `robots.txt`. `404.html` is `noindex`.

## Browser support

Current Chrome, Edge, Firefox and Safari. Uses CSS grid, `clamp()`, `text-wrap`, `backdrop-filter` and `IntersectionObserver`, each with graceful fallback.
