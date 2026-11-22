# Initial Analysis Report

**Project:** Executive portfolio for Marsellino Nasry Mounir
**Date:** 22 November 2026
**Scope:** `sarm-portfolio.zip`, `sarm-security-site.zip`, and five PDF documents (three CV variants, one BDO team profile, one BDO proposal extract)

> This document is private working material. It is kept outside the `site/` folder on purpose and must not be deployed.

---

## 1. Source inventory

| Source | What it is | Files | Notes |
|---|---|---|---|
| `sarm-portfolio.zip` | Personal portfolio, single page | 32 | Live at `marsellino-nasry.github.io` (per README). Personal positioning. |
| `sarm-security-site.zip` | SARM Security services site, single page + capability statement | 37 | Positions SARM Security as an independent consultancy ("Book a free consultation", fixed-scope engagements, retainers). |
| `Marsellino_Nasry_CV.pdf` | 2-page CV (Nov 2026, Chrome-generated) | 1 | Most complete and most recent. Primary source of truth. |
| `Marsellino_Nasry_CV_Resume.pdf` (fa81…) | 1-page CV | 1 | Condensed version of the above. Consistent. |
| `Marsellino_Nasry_CV_Resume.pdf` (a549…) | Older Enhancv CV | 1 | Earlier title ("IT Auditor"), "4+ years". Contains **date of birth and home district**. Superseded. |
| `Marsellino - BDO Profile.pdf` | BDO team-profile slide | 1 | Contains corporate email and office telephone. |
| `Marsellino_CV_BDO.pdf` | BDO proposal team-profile page | 1 | Marked **Private and Confidential**. Header names a prospective client and an RFQ. |

Both ZIPs share the same brand assets (identical portrait, logo, mark, favicon, OG image, fonts). They differ in content, positioning and some components.

## 2. Existing architecture assessment

Both sites are well built for their size:

- Plain HTML, CSS and vanilla JavaScript; no framework, no build step, no third-party scripts or CDNs.
- Self-hosted fonts (Archivo variable, JetBrains Mono 400) under the SIL OFL.
- One `index.html` per site, one stylesheet (1,035 / 1,415 lines), one script (237 / 187 lines).
- CSP in a `<meta>` tag restricting everything to `'self'` plus Formspree.
- Inline SVG sprite for icons, `<picture>` with WebP and JPEG fallback for the portrait.

**Limitations**

| # | Limitation | Impact |
|---|---|---|
| A1 | Single page per site; no dedicated project pages | Projects cannot be linked, indexed or shared individually; case-study depth is capped. |
| A2 | Icon sprite inlined in every page | Fine for one page; would be duplicated across a multi-page site. |
| A3 | Tool counts and "Showing all N tools" are hard-coded in HTML | Counts drift when tools are added. |
| A4 | 404 page uses root-absolute paths | Correct for a user site at the domain root; would break under a sub-path. |
| A5 | No `_headers` file | Cloudflare Pages / Netlify could send real security headers (including `frame-ancestors`), which a meta CSP cannot. |

## 3. Design assessment

**Strengths to keep**

- A coherent, restrained dark identity: deep navy (`#06101C`), teal (`#36D1BE`), cyan (`#7AD3F5`), teal-deep (`#12808A`).
- The SARM mark (three stacked chevrons) is distinctive and already carries meaning: *Assess, Validate, Assure*.
- The chevron-clipped portrait frame is a strong signature element.
- Archivo's width axis is used for display headings, which gives a premium editorial feel without extra font files.
- No neon, no stock "hacker" imagery, no fake terminals in the hero.

**Weaknesses**

| # | Issue |
|---|---|
| D1 | The personal portfolio leads with "SARM" in the header, so the person and the project brand compete for the same slot. |
| D2 | Section rhythm is uniform (heading, lede, grid). There is little editorial hierarchy or numbering to guide an executive reader through a long page. |
| D3 | The SARM Arsenal card shows invented command-line examples (`./vampirex.py 10.10.1.0/24 -s vuln`). They read as real usage of a private tool that cannot be verified. |
| D4 | Key achievements are repeated in several places with slightly different wording. |

## 4. Content assessment

**Consistent and verified across sources:** BDO role and start date (Aug 2024), 30+ audits, 5+ years, sectors, frameworks, environments audited, certifications and issuers, TryHackMe top 1% and Advent of Cyber 2023–2025, ISMS platform scope (Clauses 4–10, 93 Annex A controls), SARM Arsenal modules, Network-X (A+), Chrome PoC (Feb 2025), education and Harvard Online coursework.

**Inconsistencies found and how they were resolved**

| # | Inconsistency | Resolution |
|---|---|---|
| C1 | Older CV says "IT Auditor", "4+ years"; newer CVs and BDO profile say "Senior IT Auditor", "5+ years". | Used the newer documents (Nov 2026) and the brief. |
| C2 | BDO profile lists "CISSP (Diploma, 2019)" under *Professional qualifications*; the BDO proposal lists it under *Cybersecurity certifications*. | Shown only as **CISSP Diploma (Alison, 2019) — training**, with an explicit note that it is not the ISC² CISSP certification. |
| C3 | "PinTest+" / "Pin-Test+" spelling. | Corrected to *CompTIA PenTest+ training (Arab Security)*. |
| C4 | Old portfolio places Google Cybersecurity Certificate under "course certificates"; the 2-page CV and the brief list it as a certification. | Followed the brief and the 2-page CV. |
| C5 | ISMS platform: "v1" in the 2-page CV; old portfolio says "Version 2.0". | Two public repositories exist: `iso27001-platform` (v1, "ISO 27001 Ultimate Platform") and `iso27001v.2-platform` (v2, "ISMS Assurance Platform"). Both are presented, v2 as current. |
| C6 | SARM-CVE-DB described as "real-time" in the CV. | Described by what it does (aggregates NVD and CISA KEV data). The site makes no live-data claim, per the brief. |
| C7 | Old portfolio lists "Egypt PDPL" and "CBE Cybersecurity Framework" as competencies; they are not in the CVs or the brief. | Omitted from the competency lists to keep to verified content. |

**Duplicate content:** the bio, Dual-Lens table, credentials and timeline are near-duplicates between the two ZIPs with different tone (personal vs sales).

## 5. Technical assessment

| Area | Finding |
|---|---|
| HTML | Semantic landmarks, skip link, labelled controls, `aria-pressed` on filters, live regions. Good baseline. |
| CSS | Design tokens at the top; consistent naming (BEM-like). Print styles are minimal (services site only). |
| JS | Progressive enhancement; the page reads fine without JS. Filters and search work. No errors in logic review. |
| Performance | Fonts preloaded; portrait served as WebP at two sizes with `fetchpriority="high"`. OG image is a 233 KB PNG (acceptable). |
| SEO | Title, description, canonical, OG, Twitter and Person JSON-LD present. Single URL only in the sitemap. |
| Accessibility | README states axe-core WCAG 2.1 AA pass; reduced-motion respected. |

## 6. Security and privacy assessment

| # | Finding | Severity | Action |
|---|---|---|---|
| S1 | `Marsellino_CV_BDO.pdf` is a page from a BDO proposal marked **Private and Confidential** and names a prospective client and RFQ. | High | Not used on the site; not copied into the project. |
| S2 | The BDO profile includes a BDO corporate email and office line. | Medium | Not published. Only the personal Gmail and the WhatsApp number already public on the old site are used. |
| S3 | The older Enhancv CV includes date of birth and home district. | Medium | Not published. |
| S4 | All three CVs name eleven audit clients. The brief forbids publishing client names without explicit authorisation. | High | The site uses anonymised, sector-based engagement descriptions. The downloadable CV on the site is a new **public edition** generated from the anonymised content. The original CVs are not deployed. |
| S5 | The services site presents SARM Security as an independent consultancy with ProfessionalService schema, "free consultation" offers and engagement models, while the owner is employed by BDO. | Medium (reputational / employment-policy risk) | Not carried over. SARM is presented as a personal security engineering and research label. No ProfessionalService schema. A footer note states that views and projects are personal and do not represent BDO. |
| S6 | Formspree form ID (`xqabqrrl`) is in the HTML. | Info | Form IDs are designed to be public; no secret is exposed. Kept unchanged. |
| S7 | Old Arsenal card's invented CLI usage. | Low | Removed (see D3). |
| S8 | Meta CSP cannot set `frame-ancestors`. | Low | Added `_headers` for Cloudflare Pages / Netlify with full security headers. |

## 7. Functional assessment

| Function | `sarm-portfolio` | `sarm-security-site` | New site |
|---|---|---|---|
| Mobile navigation with Escape and focus | Yes | Yes | Kept, extended to a numbered full-section index |
| Active section highlighting | Yes | Yes | Kept |
| Tool search and category filter | Yes (24 tools) | No | Kept; 8 categories from the brief; multi-category tools; keyword search; counts computed in JS |
| Project filter | Yes | No | Kept; plus quick-view disclosure and dedicated case-study pages |
| Contact form (Formspree, honeypot, validation) | Yes | Yes (+ service select) | Kept endpoint; added enquiry type, organisation, timing check, cooldown, mailto fallback |
| Capability statement | No | Yes (services pitch) | Rebuilt as a personal capability statement (HTML + PDF) |
| Downloadable CV | No | No | New public-edition CV (HTML + PDF) |
| Credential filtering | No | No | New |
| Interactive timeline | No | No | New |
| Dual-Lens explorer | Static table | Static table + sample finding | New interactive scenario explorer with framework mapping |
| Back-to-top | Footer link | Footer link | Floating button + footer link |
| 404 | Yes | Yes | Rebuilt with section links |

No broken functionality was found in either source. Nothing of value was removed without a documented reason (see S5 and D3).

## 8. Improvement roadmap

1. **Identity:** lead with the person; keep SARM as the research and engineering label; adopt the brief's positioning line.
2. **Structure:** twelve numbered sections on the home page plus four dedicated project case studies, a print-ready CV and a capability statement.
3. **Confidentiality:** anonymised sector engagements; public-edition CV; no BDO internal material.
4. **Interaction:** real, keyboard-accessible components only (filters, search, tabs, disclosures, scenario explorer, validated form).
5. **SEO:** unique metadata per page, Person JSON-LD, breadcrumb and software JSON-LD on project pages, full sitemap.
6. **Security:** strict CSP on every page, `_headers` for hosts that support it, no third-party requests except Formspree on submit.
7. **QA:** automated checks with Playwright, axe-core, Lighthouse and the Nu HTML Checker; results recorded in the QA report.

## 9. Final proposed architecture

```
site/
├── index.html                       12 numbered sections
├── projects/
│   ├── isms-assurance-platform.html
│   ├── sarm-security-arsenal.html
│   ├── network-x.html
│   └── chrome-password-extractor.html
├── cv.html                          Print-friendly professional profile (source of the CV PDF)
├── capability-statement.html        One-page capability statement (source of its PDF)
├── 404.html
├── robots.txt, sitemap.xml, site.webmanifest, favicon.ico
├── _headers                         Security headers for Cloudflare Pages / Netlify
├── .nojekyll                        Serve files as-is on GitHub Pages
└── assets/
    ├── css/main.css                 Tokens, base, components, sections, print
    ├── css/document.css             A4 layout for CV and capability statement
    ├── js/main.js                   All interactions (progressive enhancement)
    ├── img/                         Portrait, logo, mark, icons, sprite, OG image
    ├── brand/                       Logo variants
    ├── fonts/                       Archivo, JetBrains Mono (OFL)
    └── docs/                        CV and capability statement PDFs
```

Home page sections: 01 Executive home · 02 About · 03 Experience · 04 IT Audit & Technology Risk · 05 Offensive Security · 06 Projects & Engineering · 07 Technical Arsenal · 08 Frameworks & Standards · 09 Certifications & Education · 10 Research & Publications · 11 Achievements · 12 Contact.
