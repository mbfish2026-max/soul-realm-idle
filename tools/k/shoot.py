"""WebKit file:// delivery check; screenshots are QA only, never game assets."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[2]
async def main():
 async with async_playwright() as p:
  browser=await p.webkit.launch()
  page=await browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto((ROOT/'assets/ui2/preview.html').as_uri())
  await page.evaluate('Promise.all(Array.from(document.images).map(i=>i.decode()))')
  assert await page.locator('img').count()==74
  assert await page.evaluate('Array.from(document.images).every(i=>i.naturalWidth>0)')
  assert await page.evaluate('document.documentElement.scrollWidth===390')
  assert not errors,errors
  out=ROOT/'tools/k/raw/qa';out.mkdir(exist_ok=True)
  await page.screenshot(path=str(out/'preview-mobile.png'))
  await page.add_script_tag(url=(ROOT/'assets/manifest.js').as_uri())
  await page.add_script_tag(url=(ROOT/'assets/ui2/manifest.js').as_uri())
  assert await page.evaluate('Object.keys(SR.ASSETS).length===116 && !!SR.ASSETS.hero_idle && !!SR.ASSETS.ui2_title')
  assert not errors,errors
  await browser.close()
  print('WebKit file://: 74 images decoded, 390px no overflow, 42 + 74 keys preserved')
asyncio.run(main())
