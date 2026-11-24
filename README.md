# marsellino-nasry.github.io

Personal portfolio of **Marsellino Nasry Mounir**, Senior IT Auditor: technology risk assurance, IT audit and offensive security.

Static site: semantic HTML, one stylesheet, one vanilla JavaScript file. No framework, no build step, no backend. Every page works without JavaScript; scripts only add interactivity.

## Structure

```
index.html                      Home: hero, Dual-Lens method, timeline, ITGC, ATT&CK, environment, frameworks, projects, skills, credentials, contact
cv.html                         CV as a web page (mirrors the PDF)
capability-statement.html       One-page capability statement (source of its PDF)
projects/*.html                 Four case studies
404.html                        Not-found page (root-absolute paths, for a user site)
assets/css/main.css             Design system and all page styles
assets/css/cv.css               CV sheet and print layout
assets/css/document.css         Capability statement sheet and print layout
assets/js/main.js               Navigation, tabs, diagrams, filters, reveal, contact form
assets/img/                     Portrait, icons sprite, SARM marks, Open Graph image
assets/docs/                    PDF downloads
```

## Downloads

| File | What it is |
|---|---|
| `assets/docs/Marsellino_Nasry_CV.pdf` | The CV, two pages, A4 |
| `assets/docs/Marsellino-Nasry-CV.pdf` | Same file, kept so older links keep working |
| `assets/img/cv/cv-page-*.webp/.jpg` | Page images used by the PDF viewer on mobile |
| `assets/docs/Marsellino-Nasry-Capability-Statement.pdf` | Capability statement, printed from `capability-statement.html` |

`cv.html` offers two views: the **web version** (HTML, searchable) and a **PDF viewer**. On desktop browsers with a built-in PDF reader the real PDF is embedded; on phones the viewer shows the page images. Printing `cv.html` reproduces the PDF layout.

To update the CV: replace both PDF files (same names), update the text in `cv.html` to match, and regenerate the two page images, for example `pdftoppm -r 150 -png Marsellino_Nasry_CV.pdf page` and convert to WebP/JPG.

## Deploy to GitHub Pages

The site is configured for the user site `https://marsellino-nasry.github.io/` (canonical URLs, sitemap and `404.html` assume the repository root).

1. Open the repository that serves `https://marsellino-nasry.github.io/` (a user site, normally named `Marsellino-Nasry.github.io`).
2. Replace its contents with the contents of this folder. Keep the `.nojekyll` file.
3. Commit and push to the `main` branch:
   ```bash
   git clone https://github.com/Marsellino-Nasry/Marsellino-Nasry.github.io.git
   cd Marsellino-Nasry.github.io
   git rm -r --quiet .            # remove the old files (history is kept)
   cp -R /path/to/github-deploy/. .
   git add -A
   git commit -m "Redesign portfolio"
   git push origin main
   ```
4. In **Settings → Pages**, set **Source: Deploy from a branch**, **Branch: main**, **Folder: / (root)**.
5. Wait for the Pages workflow to finish (Actions tab), then open the site and hard-refresh (Ctrl/Cmd + Shift + R).

`_headers` adds security headers on Cloudflare Pages or Netlify; GitHub Pages ignores it, and each page also carries a Content-Security-Policy meta tag.

## Editing notes

- Colours, type and spacing are tokens at the top of `assets/css/main.css`.
- Inline `style` attributes and inline scripts are blocked by the Content-Security-Policy. Add styles to the stylesheet instead.
- After changing CSS or JS, bump the `?v=` query string in the page `<head>` so browsers fetch the new files.
- Diagram connectors are drawn by `main.js` from the `data-edges` attribute on each `[data-graph]` element. Nodes carry `data-node` ids.
- Anything marked "illustrative", "sample data" or "conceptual" is deliberately generic and must not be replaced with client information.
