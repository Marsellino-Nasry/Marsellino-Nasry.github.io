# SARM Security: Marsellino Nasry Mounir

The personal portfolio of Marsellino Nasry Mounir, Senior IT Auditor and cybersecurity specialist (offensive security and red teaming).

It's a static site: plain HTML, CSS and JavaScript, with no framework, no build step, no backend and no third-party scripts. It runs on GitHub Pages or any other free static host.

## Folder structure

```
/
├── index.html                 Main page (all sections)
├── 404.html                   "Page not found" page (used by GitHub Pages)
├── favicon.ico                Fallback favicon for older browsers
├── site.webmanifest           App icons and theme colour
├── robots.txt, sitemap.xml    Search engine files
└── assets/
    ├── css/style.css          All styles (design tokens at the top)
    ├── js/main.js             Navigation, tool search/filter, project filter, contact form
    ├── fonts/                 Archivo (variable) and JetBrains Mono, self-hosted (SIL OFL)
    ├── images/
    │   ├── profile.webp       Portrait 820×1025 (plus profile-480.webp and profile.jpg fallback)
    │   ├── sarm-logo.svg      Horizontal logo (for dark backgrounds)
    │   ├── sarm-mark.svg      Three-arrow symbol on its own
    │   ├── favicon.svg        Browser tab icon
    │   ├── apple-touch-icon.png, icon-192.png, icon-512.png
    │   └── og-image.png       1200×630 image shown when the link is shared
    └── brand/                 Extra logo files for reports, social media and GitHub
        ├── sarm-logo-stacked.svg          Arrows above the wordmark (dark backgrounds)
        ├── sarm-logo-mono.svg             Single-colour navy (white paper, reports)
        ├── sarm-logo-stacked-mono.svg
        ├── sarm-mark-mono.svg
        ├── sarm-logo-stacked-on-ink.png   Stacked logo on navy, 1200px wide
        └── sarm-avatar-1024.png           Square avatar for GitHub, LinkedIn, etc.
```

## Run it locally

Any static file server works. With Python installed:

```bash
cd sarm-portfolio
python3 -m http.server 8000
```

Then open http://localhost:8000. Use a local server rather than double-clicking `index.html`, because some browsers block local font files when a page is opened straight from disk.

## Deploy for free on GitHub Pages

Your current site is served from the repository `Marsellino-Nasry/Marsellino-Nasry.github.io`, so publishing the new version means replacing that repository's files.

### Option A: from the command line

```bash
git clone https://github.com/Marsellino-Nasry/Marsellino-Nasry.github.io.git
cd Marsellino-Nasry.github.io
git rm -q index.html                      # remove the old single-file site
cp -R /path/to/sarm-portfolio/. .         # copy everything from this folder
git add .
git commit -m "Redesign portfolio"
git push
```

### Option B: in the browser

1. Open https://github.com/Marsellino-Nasry/Marsellino-Nasry.github.io.
2. Delete the old `index.html` (open it, then use the trash icon and commit).
3. Click **Add file → Upload files** and drag in **everything inside** this folder (`index.html`, `404.html`, `favicon.ico`, `site.webmanifest`, `robots.txt`, `sitemap.xml` and the whole `assets` folder). Commit the upload.

### Check the Pages settings

In the repository go to **Settings → Pages** and confirm **Source: Deploy from a branch**, **Branch: main**, **Folder: / (root)**. The site goes live at https://marsellino-nasry.github.io/ within a minute or two. If you still see the old design, hard-refresh (Ctrl+Shift+R).

### Other free hosts

- **Netlify:** drag this folder onto https://app.netlify.com/drop.
- **Cloudflare Pages:** create a project, choose direct upload, and upload this folder.

If you deploy somewhere other than `marsellino-nasry.github.io`, update the canonical URL and the `og:` and `twitter:` image URLs at the top of `index.html`, plus `robots.txt` and `sitemap.xml`.

## Contact form (Formspree)

The form still posts to the same Formspree endpoint as before (`https://formspree.io/f/xqabqrrl`), so messages keep arriving in your Gmail inbox exactly as configured. What changed:

- It sends with JavaScript and shows a clear "sent" or "not sent" message without leaving the page. Without JavaScript it still works as a normal form post.
- It adds an optional **Name** field, a hidden `_subject` so the emails are easy to spot, and Formspree's `_gotcha` honeypot field to filter spam bots.
- Email and message are checked before sending.

No API keys or secrets are involved: the form ID is meant to be public.

## Security and quality notes

- A Content Security Policy is set in a `<meta>` tag. Scripts, styles, fonts and images may only load from the site itself, and the form may only send to Formspree. If you add any external script or embed, add its domain to that policy or it will be blocked.
- External links open in a new tab with `rel="noopener noreferrer"`.
- There are no trackers, cookies or third-party CDNs. Fonts are self-hosted.
- Keyboard and screen-reader support: skip link, visible focus, labelled controls, live regions for filter results and form status. The page passes an axe-core WCAG 2.1 AA scan with zero violations.
- Users who prefer reduced motion get no animation.

## Editing content

- **Text:** every section of `index.html` is marked with a comment (`HERO`, `ABOUT`, `EXPERIENCE`, and so on).
- **Tools:** each tool is an `<li class="tool" data-category="...">` in the Tools section. Categories are `network`, `vuln`, `web`, `ad`, `wireless`, `intel` and `dev`. If you add or remove a tool, update the count in the matching filter button and the "Showing all N tools" text.
- **Projects:** `data-project-category` takes one or more of `grc`, `tooling` and `learning`.
- **Colours and type:** change the tokens at the top of `assets/css/style.css`.

## Credits

- Typefaces: Archivo (Omnibus-Type) and JetBrains Mono, both under the SIL Open Font License; licence texts are in `assets/fonts/`.
- Logo, layout and code: designed for SARM Security. © 2026 Marsellino Nasry Mounir.
