"""Run: python3 stage/shoot.py; local file:// WebKit verification, no server."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    repo = Path(__file__).resolve().parent.parent
    output = repo / 'docs' / 'shots'
    output.mkdir(parents=True, exist_ok=True)
    errors = []
    async with async_playwright() as p:
        browser = await p.webkit.launch()
        page = await browser.new_page(viewport={'width':390,'height':844}, device_scale_factor=1)
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
        await page.goto((repo / 'stage' / 'demo.html').as_uri())
        for name, scene, wait, ok in [('regular','regular',700,True),('boss','boss',900,True),('fusion','fusion',850,True),('absorb','absorb',1200,True),('absorb_ok','absorb',1650,True),('absorb_fail','absorb',1650,False)]:
            await page.evaluate('args => STAGE_DEMO.scene(args[0],args[1])', [scene,ok])
            await page.wait_for_timeout(wait)
            assert await page.evaluate('document.documentElement.scrollWidth <= 390'), 'horizontal overflow'
            broken = await page.locator('img').evaluate_all('(imgs) => imgs.filter(i => !i.complete || !i.naturalWidth).map(i => i.src)')
            assert not broken, broken
            await page.screenshot(path=str(output / ('c_'+name+'.png')))
            print(name, '390x844 OK')
        await page.wait_for_timeout(3600)
        assert not await page.evaluate('STAGE_DEMO.view.fx.active'), 'particles did not stop'
        await page.evaluate("STAGE_DEMO.scene('boss'); STAGE_DEMO.scene('regular'); STAGE_DEMO.view.destroy()")
        await page.wait_for_timeout(1600)
        assert await page.locator('#stage').evaluate('(el) => el.children.length === 0'), 'destroy left nodes'
        await browser.close()
    assert not errors, errors
    print('WebKit console clean; images loaded; particles stopped; destroy clean')

asyncio.run(main())
