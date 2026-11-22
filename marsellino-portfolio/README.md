# Marsellino Nasry Mounir — Portfolio

Executive portfolio for Marsellino Nasry Mounir, Senior IT Auditor: technology risk assurance, IT governance and offensive security.

Plain HTML, CSS and JavaScript. No framework, no build step, no backend, no third-party scripts, no tracking. Runs on GitHub Pages, Cloudflare Pages, Netlify or any static host.

## What's in this folder

```
marsellino-portfolio/
├── site/      ← the website. Deploy the CONTENTS of this folder.
├── docs/      ← private reports. Do NOT deploy or push to a public repo.
│   ├── 01-ANALYSIS-REPORT.md     Initial analysis of the two source sites and CVs
│   ├── 02-CONTENT-INVENTORY.md   Source of truth for every fact on the site
│   ├── 03-DEPLOYMENT.md          GitHub Pages and Cloudflare Pages, step by step
│   ├── 04-TECHNICAL.md           Architecture, components, editing guide
│   ├── 05-QA-REPORT.md           What was tested, how, and the results
│   └── qa-test-output.txt        Raw output of the final automated test run
└── tools/     ← optional helper scripts (not needed to run the site)
    ├── build_pdfs.py             Regenerates the CV and capability statement PDFs
    └── qa_test.py                Re-runs the automated QA suite
```

## Run it locally

```bash
cd site
python3 -m http.server 8000
```

Open http://localhost:8000. Use a local server rather than double-clicking `index.html`: browsers block some local files (fonts, the icon sprite) on `file://`.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Twelve numbered sections: home, about, experience, IT audit, offensive security, projects, arsenal, frameworks, credentials, research, achievements, contact |
| `projects/*.html` | Four full case studies |
| `cv.html` | Printable CV (public edition); source of `assets/docs/Marsellino-Nasry-CV.pdf` |
| `capability-statement.html` | One-page capability statement; source of its PDF |
| `404.html` | Custom not-found page |

## Contact form

The form keeps the existing Formspree endpoint, **`https://formspree.io/f/xqabqrrl`**. Formspree delivers each submission to the inbox set on that form in your Formspree dashboard, which should be **marsellino.nasry@gmail.com**. To confirm:

1. Sign in at https://formspree.io and open the form `xqabqrrl`.
2. Under **Settings → Email**, check the target email is `marsellino.nasry@gmail.com`.
3. Send one test message from the live site and check Gmail (and the spam folder the first time).

Form IDs are public by design. There is no API key or secret in the site.

Spam protection: Formspree honeypot (`_gotcha`), a minimum time on page before sending, a 60-second cooldown between sends, field validation, length limits and a consent checkbox. If sending fails, the visitor gets a pre-filled `mailto:` link as a fallback.

## Deploy

See `docs/03-DEPLOYMENT.md`. Short version for GitHub Pages: replace the contents of the `Marsellino-Nasry.github.io` repository with the contents of `site/`, commit and push.

## Confidentiality decisions you should know about

- **Audit clients are anonymised** (for example "public-sector bank"), as your brief requires. To name them, see `docs/04-TECHNICAL.md` → *Engagements*. Only do this with written authorisation.
- **The downloadable CV is a new public edition** built from the site content. Your original CVs name clients, so they are not published.
- **Bug bounty programmes** (Starbucks Japan, inDrive, Vodafone Oman) are named because they are public programmes, not audit clients, with a no-affiliation note. Remove them in `index.html` and `cv.html` if you prefer.
- **The SARM services site** (consultation offers, engagement models, ProfessionalService schema) was not carried over, to avoid presenting an independent consultancy alongside your BDO role. SARM appears as your personal research and engineering label.
- The BDO proposal page (marked *Private and Confidential*) and the BDO profile were used only to verify facts. Nothing from them is published.

## Credits

Typefaces: Archivo and JetBrains Mono, SIL Open Font License (texts in `site/assets/fonts/`). Brand mark and logo: SARM, from your existing assets. © Marsellino Nasry Mounir.
