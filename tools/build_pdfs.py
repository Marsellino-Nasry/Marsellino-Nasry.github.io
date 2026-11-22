"""Regenerate the CV and capability statement PDFs from their HTML pages.

Usage (from the project root, with a local server running on port 8000):
    cd site && python3 -m http.server 8000 &
    pip install playwright && python3 -m playwright install chromium
    python3 tools/build_pdfs.py
"""
import asyncio, pathlib, sys
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
OUT = pathlib.Path(__file__).resolve().parent.parent / "site" / "assets" / "docs"
import os
LAUNCH = {"executable_path": os.environ["CHROME"]} if os.environ.get("CHROME") else {}
DOCS = {
    "cv.html": "Marsellino-Nasry-CV.pdf",
    "capability-statement.html": "Marsellino-Nasry-Capability-Statement.pdf",
}

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(**LAUNCH)
        page = await browser.new_page()
        for src, name in DOCS.items():
            await page.goto(f"{BASE}/{src}", wait_until="networkidle")
            await page.emulate_media(media="print")
            await page.pdf(path=str(OUT / name), format="A4", print_background=True, prefer_css_page_size=True)
            print("wrote", OUT / name)
        await browser.close()

asyncio.run(main())
