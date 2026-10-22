async (page) => {
  const origin = 'http://127.0.0.1:3025';
  await page.context().request.post(origin + '/admin/session', { form: { password: 'prism-browser-password' }, headers: { origin }, maxRedirects: 0 });
  const check = (value, message) => { if (!value) throw new Error(message); };
  const reports = [];
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: width === 1280 ? 720 : 844 });
    await page.goto(origin + '/preview/prism', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const enableMotion = page.getByRole('button', { name: 'Enable motion', exact: true });
    if (await enableMotion.count()) await enableMotion.click();
    await page.waitForTimeout(1100);
    const data = await page.evaluate(() => {
      const css = (selector, property) => getComputedStyle(document.querySelector(selector))[property];
      const rect = (selector) => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
      return { header: css('.prism-header','position'), hero: rect('#hero'), nameSize: css('#prism-hero-title','fontSize'), nameLine: css('#prism-hero-title','lineHeight'), nameWeight: css('#prism-hero-title','fontWeight'), sectionPadding: css('#skills','paddingTop'), titleLine: css('#prism-skills-title','lineHeight'), skillsPadding: css('.prism-skills-grid article','paddingTop'), marqueeDuration: css('.prism-marquee-track','animationDuration'), footerAlign: css('.prism-footer','textAlign'), photoHeight: css('.prism-portrait img','height'), educationInAbout: !!document.querySelector('#about #education') };
    });
    check(data.header === 'fixed', 'Header must overlay the hero like the reference');
    check(data.hero.y === 0, 'Header adds an unapproved hero offset');
    check(data.nameWeight === '800', 'Hero heading weight differs');
    check(data.nameLine === (width === 1280 ? '72px' : '40px'), 'Hero line height differs');
    check(data.sectionPadding === '96px', 'Section vertical rhythm differs');
    check(data.titleLine === (width === 1280 ? '48px' : '36px'), 'Section title line height differs');
    check(data.skillsPadding === '28px', 'Skill card padding differs');
    check(data.marqueeDuration === '30s', 'Marquee timing differs');
    check(data.photoHeight === (width === 1280 ? '440px' : '380px'), 'Portrait crop height differs');
    check(data.educationInAbout, 'Education is detached from the about layout');
    check(data.footerAlign === 'left', 'Footer remains centered');
    await page.locator('#projects').evaluate(el => scrollTo({ top: el.offsetTop - 80, behavior: 'instant' }));
    await page.waitForTimeout(800);
    if (width === 1280) {
      const alignment = await page.evaluate(() => { const h = document.querySelector('#prism-projects-title').getBoundingClientRect(), c = document.querySelector('.prism-carousel-controls').getBoundingClientRect(); return c.x > h.right && Math.abs(c.bottom - h.bottom) < 3; });
      check(alignment, 'Carousel controls must align beside desktop heading');
    }
    const next = page.getByRole('button',{name:'Next project',exact:true});
    await next.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1100);
    check(await next.evaluate(el => document.activeElement === el), 'Animated carousel loses keyboard focus');
    await page.evaluate(() => scrollTo({top:0,behavior:'instant'}));
    await page.locator('.prism-skip').focus();
    await page.keyboard.press('Enter');
    check(await page.locator('#main-content').evaluate(el => document.activeElement === el), 'Skip link does not focus main content');
    const title = await page.locator('.prism-carousel article:visible h3').textContent();
    await page.getByRole('button',{name:'Next project',exact:true}).click();
    await page.waitForTimeout(1100);
    check(await page.locator('.prism-carousel article:visible h3').textContent() !== title, 'Animated carousel failed');
    reports.push({ width, ...data });
  }
  return reports;
}
