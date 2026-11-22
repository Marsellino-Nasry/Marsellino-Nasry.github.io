# Testing and QA Report

**Date:** 22 November 2026 · **Build:** final delivered version
**Environment:** Python `http.server` on localhost, Google Chrome (headless) via Playwright 1.63, axe-core 4.x, Lighthouse, Nu HTML Checker (vnu-jar).

Only tests that were actually run are reported as passed. Items that could not be tested here are listed under *Not tested*.

## Summary

| Area | Tool | Result |
|---|---|---|
| HTML validity, 8 pages | Nu HTML Checker | **0 errors** (after fixing 3 `aria-labelledby` and 4 heading-level errors) |
| CSS and SVG validity | Nu HTML Checker | **0 errors** |
| JavaScript syntax | `node --check` | Pass |
| Automated functional suite | `tools/qa_test.py` | **103 passed, 0 failed** (raw output: `qa-test-output.txt`) |
| Accessibility, 8 pages | axe-core, tags WCAG 2.0/2.1/2.2 A+AA and best practice | **0 violations** on every page |
| Lighthouse, home (mobile) | Lighthouse | Performance 99 · Accessibility 100 · Best practices 100 · SEO 100 · LCP 1.5 s · CLS 0 |
| Lighthouse, home (desktop) | Lighthouse | 100 · 100 · 100 · 100 · LCP 0.4 s · CLS 0 |
| Lighthouse, ISMS case study (mobile) | Lighthouse | 100 · 100 · 100 · 100 |
| Lighthouse, CV (desktop) | Lighthouse | 100 · 100 · 100 · 100 |
| Confidentiality scan | `grep` over site files and PDF text | No client names, BDO contact details, proposal references, date of birth or address |
| Secrets scan | `grep` for keys, tokens, secrets | None found |

Lighthouse's remaining hints (unminified files, cache lifetimes) relate to the local test server; cache headers are set in `_headers` for Cloudflare Pages and Netlify. Minification was left out deliberately to keep the code easy to edit.

## What the automated suite checks (`tools/qa_test.py`)

**Every page (at 1440 px):** no console errors; no failed local requests; all images load (after scrolling through the page); title, description, a single `h1`, `lang`, `alt` on every image; canonical and `og:image`; no horizontal overflow; axe-core scan.

**Links:** all 60+ unique internal links return 200, and every `#fragment` target exists on its page. CV and capability statement PDFs download with `application/pdf`.

**Interactions:** tool search (keyword "kerberos" → Rubeus and Impacket), empty state and reset, category filter, `aria-pressed` state; project, credential (certifications = 6, training = 11) and timeline filters; Dual-Lens tabs by click and arrow keys with focus management; audit-methodology tabs; timeline expand; back-to-top appears and returns to the top.

**Contact form** (Formspree mocked by intercepting the request):
- empty submit shows field errors and focuses the first invalid field; nothing is sent;
- invalid email rejected;
- valid submit sends one POST containing name, email, topic, message, `_gotcha` and the subject `Portfolio enquiry: <topic> from <name>`; success message shown; form reset;
- second send within 60 seconds blocked with a clear message;
- server error (422) shown with a `mailto:marsellino.nasry@gmail.com` fallback link;
- network failure handled;
- honeypot-filled submission not sent.

**Responsive:** no horizontal overflow on home, a case study and the CV at 1024, 768 and 390 px.

**Mobile navigation (390 px):** menu opens, focus moves into it, Escape closes it and returns focus to the toggle, a menu link scrolls to its section and closes the menu.

**Keyboard:** first Tab reaches the skip link. Tabs support Arrow, Home and End keys. The menu keeps focus inside while open.

**Without JavaScript:** all five Dual-Lens scenarios and all 29 tools are visible; filter controls are hidden (no dead buttons); the form still posts to Formspree.

**Reduced motion:** the portrait animation is disabled.

## Defects found during QA and fixed

| # | Defect | Fix |
|---|---|---|
| 1 | Tab component scrolled the page on load (`scrollIntoView`) | Scroll only the tab strip horizontally |
| 2 | Header `backdrop-filter` made the header the containing block of the fixed mobile menu, clipping it to 68 px height so lower links were unreachable | Blur moved to a `::before` pseudo-element |
| 3 | Audit-methodology tab strip overflowed at 390 and 768 px | `min-width: 0` on the grid column; full-width tabs only on desktop |
| 4 | `aria-labelledby` on plain `div`s (3) | Changed to `section` or removed |
| 5 | Skipped heading levels (h2 → h4) | Re-levelled to h3 |
| 6 | Footer logo lazy-loaded and not ready when checked | Eager load (2 KB SVG) |
| 7 | Stacked contact links on the A4 pages under 24 px target size (WCAG 2.5.8) | 24 px minimum on screen |
| 8 | Narrow-screen rules applied in print, so the CV ran to 3 pages | Rules limited to `screen`; CV now 2 pages, capability statement 1 page |
| 9 | Designation separators showed at the start of wrapped lines; achievements column too narrow | Layout corrected |

## Manual visual review

Full-page screenshots were reviewed at 1440 px (home, SARM case study) and 390 px (home, mobile menu). The CV and capability statement PDFs were rendered to images and checked for layout and page count.

## External links

External links were not requested from the test environment (outbound network is restricted there). The project links were verified through a separate web fetch during discovery:

| Link | Result |
|---|---|
| github.com/Marsellino-Nasry/iso27001v.2-platform | Reachable, README matches the case study |
| github.com/Marsellino-Nasry/iso27001-platform | Reachable |
| github.com/Marsellino-Nasry/Python-psw-chrome | Reachable |
| github.com/Marsellino-Nasry/Graduation-Project- | Reachable |
| marsellino-nasry.github.io/iso27001v.2-platform/ | Page responds (loading screen of the app) |
| github.com/Marsellino-Nasry/VAMPIRE-X | Not found, so no SARM repository is linked |

Not verified here: CodeAlpha repository (rate-limited during the check), LinkedIn, TryHackMe, HackerOne, WhatsApp and the 25 third-party tool sites. All use HTTPS. Please click through them once after deploying.

## Not tested

- **Real email delivery.** The form was tested against a mocked endpoint so that no test message reached your inbox. Send one real message after deploying and confirm it arrives at marsellino.nasry@gmail.com (see `03-DEPLOYMENT.md`).
- **Firefox and Safari.** Testing used Chrome only. The code uses standard, widely supported features.
- **Real screen readers** (NVDA, VoiceOver). Accessibility was tested with axe-core and keyboard checks, not with assistive technology.
- **`_headers` behaviour.** Requires deployment on Cloudflare Pages or Netlify.
