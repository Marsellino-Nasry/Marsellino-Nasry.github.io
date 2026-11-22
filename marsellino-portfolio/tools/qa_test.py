"""Automated QA for the portfolio: console errors, assets, links, axe-core, interactions,
contact form (with a mocked Formspree endpoint), responsiveness and no-JS rendering.

Usage:  cd site && python3 -m http.server 8000 &
        python3 tools/qa_test.py http://127.0.0.1:8000 path/to/axe.min.js
Optional env CHROME=/path/to/chrome. Prints PASS/FAIL lines and exits non-zero on failure.
"""
import asyncio, json, os, sys, urllib.parse, urllib.request
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
AXE = open(sys.argv[2]).read() if len(sys.argv) > 2 else None
LAUNCH = {"executable_path": os.environ["CHROME"]} if os.environ.get("CHROME") else {}
PAGES = ["/", "/projects/isms-assurance-platform.html", "/projects/sarm-security-arsenal.html",
         "/projects/network-x.html", "/projects/chrome-password-extractor.html", "/cv.html",
         "/capability-statement.html", "/404.html"]
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail else ""))


def http_status(url):
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, r.headers.get("Content-Type", "")
    except urllib.error.HTTPError as e:
        return e.code, ""


async def scroll_through(page):
    await page.evaluate("""async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); }""")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(**LAUNCH)

        # ---- 1. Per-page checks -------------------------------------------------
        links = {}
        for path in PAGES:
            ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, bypass_csp=True)
            page = await ctx.new_page()
            errors, bad = [], []
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("response", lambda r: bad.append(f"{r.status} {r.url}") if r.status >= 400 and r.url.startswith(BASE) and not r.url.endswith("/404.html") else None)
            await page.goto(BASE + path, wait_until="networkidle")
            await scroll_through(page)
            await page.wait_for_timeout(300)
            check(f"{path}: no console errors", not errors, "; ".join(errors[:3]))
            check(f"{path}: no failed local requests", not bad, "; ".join(bad[:3]))
            broken = await page.evaluate("Array.from(document.images).filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src)")
            check(f"{path}: all images load", not broken, ", ".join(broken))
            meta = await page.evaluate("""() => ({ title: document.title, desc: (document.querySelector('meta[name=description]')||{}).content || '',
                canon: (document.querySelector('link[rel=canonical]')||{}).href || '', h1: document.querySelectorAll('h1').length,
                ogimg: (document.querySelector('meta[property="og:image"]')||{}).content || '', lang: document.documentElement.lang,
                alt: Array.from(document.images).filter(i => !i.hasAttribute('alt')).length })""")
            check(f"{path}: title, description, one h1, lang, alt attributes", meta["title"] and meta["desc"] and meta["h1"] == 1 and meta["lang"] and meta["alt"] == 0, json.dumps(meta)[:160])
            if path != "/404.html":
                check(f"{path}: canonical and og:image", meta["canon"] and meta["ogimg"])
            overflow = await page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
            check(f"{path}: no horizontal overflow at 1440", overflow <= 0, str(overflow))
            if AXE:
                await page.evaluate(AXE)
                res = await page.evaluate("axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice'] } }).then(r => r.violations.map(v => v.id + ' (' + v.impact + ', ' + v.nodes.length + ')'))")
                check(f"{path}: axe-core WCAG 2.2 AA + best practice", not res, "; ".join(res))
            links[path] = await page.evaluate("Array.from(document.querySelectorAll('a[href]')).map(a => a.href)")
            await ctx.close()

        # ---- 2. Internal links and fragment targets -----------------------------
        internal = sorted({u for v in links.values() for u in v if u.startswith(BASE)})
        ids_cache, broken = {}, []
        ctx = await browser.new_context()
        page = await ctx.new_page()
        for u in internal:
            url, _, frag = u.partition("#")
            st, ctype = http_status(url)
            if st != 200:
                broken.append(f"{st} {u}")
                continue
            if frag and "html" in ctype:
                if url not in ids_cache:
                    await page.goto(url)
                    ids_cache[url] = set(await page.evaluate("Array.from(document.querySelectorAll('[id]')).map(e => e.id)"))
                if frag not in ids_cache[url]:
                    broken.append(f"missing #{frag} on {url}")
        check(f"internal links resolve ({len(internal)} unique)", not broken, "; ".join(broken[:5]))
        external = sorted({u for v in links.values() for u in v if u.startswith("http") and not u.startswith(BASE)})
        print("external links (verify manually or with a link checker):\n  " + "\n  ".join(external))
        st, ctype = http_status(BASE + "/assets/docs/Marsellino-Nasry-CV.pdf")
        check("CV PDF downloadable", st == 200 and "pdf" in ctype, f"{st} {ctype}")
        st, ctype = http_status(BASE + "/assets/docs/Marsellino-Nasry-Capability-Statement.pdf")
        check("Capability statement PDF downloadable", st == 200 and "pdf" in ctype, f"{st} {ctype}")
        await ctx.close()

        # ---- 3. Interactions on the home page ----------------------------------
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()
        await page.goto(BASE + "/", wait_until="networkidle")
        vis = lambda sel: page.evaluate(f"Array.from(document.querySelectorAll('{sel}')).filter(e => !e.hidden).length")

        await page.fill("[data-filter-search=tools]", "kerberos")
        await page.wait_for_timeout(250)
        n = await vis("[data-filter-list=tools] > li")
        status = await page.text_content("[data-filter-status=tools]")
        check("tool search 'kerberos' finds Rubeus and Impacket", n == 2, f"{n}; {status}")
        await page.fill("[data-filter-search=tools]", "zzzz")
        await page.wait_for_timeout(250)
        check("tool search empty state shown", await page.is_visible("[data-filter-empty=tools]"))
        await page.click("[data-filter-reset=tools]")
        check("tool reset restores all 29", await vis("[data-filter-list=tools] > li") == 29)
        await page.click("[data-filter-group=tools] [data-filter=wireless]")
        check("tool category filter (wireless = 1)", await vis("[data-filter-list=tools] > li") == 1)
        check("chip aria-pressed updates", await page.get_attribute("[data-filter-group=tools] [data-filter=wireless]", "aria-pressed") == "true")

        await page.click("[data-filter-group=projects] [data-filter=grc]")
        check("project filter (GRC = 1)", await vis("[data-filter-list=projects] > article") == 1)
        await page.click("[data-filter-group=creds] [data-filter=cert]")
        check("credential filter (certifications = 6)", await vis("[data-filter-list=creds] > li") == 6)
        await page.click("[data-filter-group=creds] [data-filter=training]")
        check("credential filter (training = 11)", await vis("[data-filter-list=creds] > li") == 11)
        await page.click("[data-filter-group=timeline] [data-filter=professional]")
        check("timeline filter (professional = 1)", await vis("[data-filter-list=timeline] > li") == 1)

        tabs = page.locator(".lens__tab")
        check("Dual-Lens explorer has 5 tabs", await tabs.count() == 5)
        await tabs.nth(2).click()
        check("Dual-Lens tab click shows panel 3 only", await page.is_visible("#lens-3") and not await page.is_visible("#lens-1"))
        await tabs.nth(2).press("ArrowRight")
        check("Dual-Lens arrow key moves to panel 4", await page.is_visible("#lens-4") and await page.evaluate("document.activeElement.id") == "lens-4-tab")
        await page.locator(".lifecycle__tab").nth(3).click()
        check("Audit methodology tab 4 (ToE) shows", await page.is_visible("#lc-4"))

        details = page.locator(".tl").nth(1).locator("summary")
        await page.click("[data-filter-group=timeline] [data-filter=all]")
        await details.click()
        check("timeline entry expands", await page.evaluate("document.querySelectorAll('.tl details')[1].open"))

        await page.evaluate("window.scrollTo(0, 3000)")
        await page.wait_for_timeout(400)
        check("back-to-top button appears after scrolling", await page.evaluate("document.querySelector('.to-top').classList.contains('is-visible')"))
        await page.click(".to-top")
        await page.wait_for_timeout(900)
        check("back-to-top returns to top", await page.evaluate("window.scrollY") < 50)

        # ---- 4. Contact form ----------------------------------------------------
        hits = []
        mode = {"v": "ok"}

        async def formspree(route):
            hits.append(route.request.post_data or "")
            if mode["v"] == "ok":
                await route.fulfill(status=200, content_type="application/json", body='{"ok":true}')
            elif mode["v"] == "err":
                await route.fulfill(status=422, content_type="application/json", body='{"errors":[{"message":"Email is invalid"}]}')
            else:
                await route.abort()
        await page.route("https://formspree.io/**", formspree)
        await page.evaluate("try { localStorage.removeItem('contact:lastSent') } catch (e) {}")
        await page.click("[data-submit]")
        err_visible = await page.is_visible("#f-name-err")
        focused = await page.evaluate("document.activeElement.id")
        check("form: empty submit shows errors and focuses first field", err_visible and focused == "f-name", focused)
        check("form: no request sent when invalid", not hits)
        await page.fill("#f-name", "QA Tester")
        await page.fill("#f-email", "not-an-email")
        await page.select_option("#f-topic", "Offensive security")
        await page.fill("#f-message", "This is an automated QA message for validation testing.")
        await page.check("#f-consent")
        await page.click("[data-submit]")
        check("form: invalid email rejected", await page.is_visible("#f-email-err") and not hits)
        await page.fill("#f-email", "qa@example.com")
        await page.wait_for_timeout(3200)
        await page.click("[data-submit]")
        await page.wait_for_timeout(800)
        st = await page.text_content("[data-form-status]")
        check("form: valid submit posts to Formspree and shows success", len(hits) == 1 and "Message sent" in st, st)
        check("form: subject and fields included", "Portfolio enquiry: Offensive security from QA Tester" in hits[0] and "qa@example.com" in hits[0] and "_gotcha" in hits[0])
        check("form: reset after success", await page.input_value("#f-name") == "")
        # cooldown
        await page.fill("#f-name", "QA Tester"); await page.fill("#f-email", "qa@example.com")
        await page.select_option("#f-topic", "Something else"); await page.fill("#f-message", "Second message within the cooldown window.")
        await page.check("#f-consent")
        await page.click("[data-submit]")
        await page.wait_for_timeout(300)
        st = await page.text_content("[data-form-status]")
        check("form: cooldown blocks a second send within 60s", len(hits) == 1 and "less than a minute" in st, st)
        # server error and network failure
        await page.evaluate("localStorage.removeItem('contact:lastSent')")
        mode["v"] = "err"
        await page.click("[data-submit]")
        await page.wait_for_timeout(800)
        st = await page.text_content("[data-form-status]")
        href = await page.get_attribute("[data-form-status] a", "href")
        check("form: server error shown with mailto fallback", "Email is invalid" in st and href and href.startswith("mailto:marsellino.nasry@gmail.com"), st)
        mode["v"] = "abort"
        await page.click("[data-submit]")
        await page.wait_for_timeout(800)
        st = await page.text_content("[data-form-status]")
        check("form: network failure handled", "connection failed" in st, st)
        # honeypot
        mode["v"] = "ok"; n_before = len(hits)
        await page.evaluate("document.getElementById('f-gotcha').value = 'bot'")
        await page.click("[data-submit]")
        await page.wait_for_timeout(400)
        check("form: honeypot-filled submission is not sent", len(hits) == n_before)
        await ctx.close()

        # ---- 5. Mobile navigation and responsive layout --------------------------
        for w in (1024, 768, 390):
            ctx = await browser.new_context(viewport={"width": w, "height": 860})
            page = await ctx.new_page()
            for path in PAGES[:2] + ["/cv.html"]:
                await page.goto(BASE + path, wait_until="networkidle")
                ov = await page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
                check(f"{path}: no horizontal overflow at {w}px", ov <= 0, str(ov))
            if w == 390:
                await page.goto(BASE + "/", wait_until="networkidle")
                await page.click(".nav-toggle")
                check("mobile menu opens", await page.is_visible("#site-menu") and await page.get_attribute(".nav-toggle", "aria-expanded") == "true")
                check("mobile menu focuses first link", await page.evaluate("document.activeElement.closest('#site-menu') !== null"))
                await page.keyboard.press("Escape")
                check("Escape closes menu and returns focus", not await page.is_visible("#site-menu") and await page.evaluate("document.activeElement.classList.contains('nav-toggle')"))
                await page.click(".nav-toggle")
                await page.click("#site-menu a[href='#arsenal']")
                await page.wait_for_timeout(2500)  # smooth scroll over a long page
                check("menu link navigates and closes menu", not await page.is_visible("#site-menu") and await page.evaluate("Math.abs(document.getElementById('arsenal').getBoundingClientRect().top) < 140"))
            await ctx.close()

        # ---- 6. Keyboard: skip link --------------------------------------------
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()
        await page.goto(BASE + "/", wait_until="networkidle")
        await page.keyboard.press("Tab")
        check("first Tab focuses skip link", await page.evaluate("document.activeElement.className") == "skip-link")
        await ctx.close()

        # ---- 7. Without JavaScript --------------------------------------------
        ctx = await browser.new_context(java_script_enabled=False, viewport={"width": 1440, "height": 900})
        page = await ctx.new_page()
        await page.goto(BASE + "/", wait_until="networkidle")
        check("no-JS: all 5 Dual-Lens scenarios visible", await page.locator(".lens__panel:visible").count() == 5)
        check("no-JS: filter chips hidden (no dead controls)", await page.locator(".chips:visible").count() == 0)
        check("no-JS: all 29 tools listed", await page.locator(".tool:visible").count() == 29)
        check("no-JS: contact form posts to Formspree", await page.get_attribute("#contact-form", "action") == "https://formspree.io/f/xqabqrrl")
        await ctx.close()

        # ---- 8. Reduced motion ---------------------------------------------------
        ctx = await browser.new_context(reduced_motion="reduce")
        page = await ctx.new_page()
        await page.goto(BASE + "/", wait_until="networkidle")
        dur = await page.evaluate("getComputedStyle(document.querySelector('.portrait__frame')).animationDuration")
        check("reduced motion disables the portrait animation", dur in ("1e-05s", "0.00001s", "0s"), dur)
        await ctx.close()
        await browser.close()

    failed = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(failed)} passed, {len(failed)} failed")
    sys.exit(1 if failed else 0)

asyncio.run(main())
