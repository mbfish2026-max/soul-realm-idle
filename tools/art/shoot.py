#!/usr/bin/env python3
"""Capture preview in WebKit at 390x844; all artwork must load successfully."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parents[2]
async def main():
    async with async_playwright() as p:
        browser = await p.webkit.launch()
        page = await browser.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto((ROOT / 'assets/preview.html').as_uri())
        await page.evaluate('Promise.all(Array.from(document.images).map(i => i.decode()))')
        assert await page.evaluate('Array.from(document.images).every(i => i.naturalWidth > 0)')
        assert not errors, errors
        assert await page.evaluate('document.documentElement.scrollWidth === 390')
        out = ROOT / 'docs/shots/d_assets.png'
        out.parent.mkdir(parents=True, exist_ok=True)
        await page.screenshot(path=str(out), full_page=False)
        print(out)
        await page.click('#music')
        await page.wait_for_function('SR.audio.isUnlocked() && SR.bgm.isEnabled()')
        await page.click('#music')
        assert await page.evaluate('!SR.bgm.isEnabled()')
        assert not errors, errors
        print('WebKit: images, viewport, trusted gesture unlock and BGM toggle passed')
        await browser.close()
asyncio.run(main())
