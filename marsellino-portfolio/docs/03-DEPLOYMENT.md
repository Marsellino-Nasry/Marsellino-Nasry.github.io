# Deployment

Deploy the **contents** of `site/` only. Never deploy `docs/` or `tools/`.

## GitHub Pages (current host: marsellino-nasry.github.io)

### From the command line

```bash
git clone https://github.com/Marsellino-Nasry/Marsellino-Nasry.github.io.git
cd Marsellino-Nasry.github.io
git rm -r -q .                                  # remove the old site (it stays in git history)
cp -R /path/to/marsellino-portfolio/site/. .    # copy the new site, including .nojekyll and _headers
git add -A
git commit -m "Launch redesigned portfolio"
git push
```

### In the browser

1. Open the repository on GitHub and delete the old files (or use **Add file → Upload files** to overwrite them).
2. Upload everything inside `site/`, including the hidden `.nojekyll` file and the `assets` and `projects` folders.
3. **Settings → Pages:** Source *Deploy from a branch*, Branch *main*, Folder */ (root)*.

The site is live at https://marsellino-nasry.github.io/ within a few minutes. Hard-refresh (Ctrl+Shift+R) if you still see the old design.

**Notes for GitHub Pages**
- `404.html` is served automatically for missing pages.
- `.nojekyll` tells GitHub to serve files as-is.
- `_headers` is ignored by GitHub Pages; the meta Content-Security-Policy in each page still applies.

## Cloudflare Pages (recommended if you want full security headers)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Upload assets** (or connect the GitHub repository).
2. Upload the contents of `site/`. No build command; output directory `/`.
3. Cloudflare applies `_headers` automatically: CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and cache rules.

Netlify (drag `site/` onto https://app.netlify.com/drop) also honours `_headers`.

## If the domain changes

Search and replace `https://marsellino-nasry.github.io` in:
- every `.html` file (canonical, `og:url`, JSON-LD),
- the `og:image` and `twitter:image` meta tags in the head of every page,
- `robots.txt` and `sitemap.xml`.

## After deploying

- [ ] Open the home page, a project page, `cv.html` and a missing URL (to see the 404).
- [ ] Download the CV PDF.
- [ ] Send one real message through the contact form and confirm it reaches marsellino.nasry@gmail.com.
- [ ] Paste the URL into https://www.linkedin.com/post-inspector/ to refresh the preview image.
- [ ] Submit `https://marsellino-nasry.github.io/sitemap.xml` in Google Search Console.
