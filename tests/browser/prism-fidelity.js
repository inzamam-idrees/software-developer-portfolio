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
  // Run this portion only with AB/CD roles in /tmp/prism-review-data; never real content.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin + '/preview/prism', { waitUntil: 'networkidle' });
  const profile = { name: await page.locator('#prism-hero-title .prism-sr-only').textContent(), designation: await page.locator('.prism-role-text').textContent() };
  await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: width === 1280 ? 720 : 844 });
      await page.goto(origin + '/preview/prism', { waitUntil: 'networkidle' });
      const enable = page.getByRole('button', { name: 'Enable motion', exact: true });
      if (await enable.count()) await enable.click();
      await page.waitForTimeout(1500);
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      const name = page.locator('#prism-hero-title .prism-scramble-layer');
      const realName = profile.name;
      const before = await page.locator('#hero').evaluate(el => el.getBoundingClientRect().height);
      await page.mouse.move(0, 0);
      await page.locator('#prism-hero-title .prism-scramble').hover();
      await page.waitForTimeout(80);
      check(await name.textContent() !== realName, 'Name did not scramble');
      await page.waitForTimeout((realName.length * 2 + 1) * 28 + 100);
      check(await name.textContent() === realName, 'Name did not resolve exactly');
      const samples = [];
      for (let i = 0; i < 36; i++) {
        samples.push({ time: Date.now(), text: await page.locator('.prism-role-text').evaluate(el => el.textContent), opacity: await page.locator('.prism-role-caret').evaluate(el => getComputedStyle(el).opacity) });
        await page.waitForTimeout(100);
      }
      check(samples.some(s => s.text === 'AB') && samples.some(s => s.text === 'CD'), 'Roles did not advance and hold');
      check(new Set(samples.map(s => s.opacity)).size > 2, 'Caret does not blink');
      const events = await page.evaluate(() => new Promise(resolve => {
        const node = document.querySelector('.prism-role-text');
        const events = [];
        const observer = new MutationObserver(() => events.push({ time: performance.now(), text: node.textContent }));
        observer.observe(node, { childList: true, subtree: true, characterData: true });
        setTimeout(() => { observer.disconnect(); resolve(events); }, 5500);
      }));
      const deltas = events.slice(1).map((event, i) => ({ from: events[i].text.length, to: event.text.length, ms: event.time - events[i].time }));
      const near = (from, to, expected, tolerance) => deltas.some(d => d.from === from && d.to === to && Math.abs(d.ms - expected) < tolerance);
      check(near(1, 2, 90, 80), 'Typing cadence differs from reference');
      check(near(2, 1, 1890, 180), 'Full-role hold differs from reference');
      check(near(1, 0, 45, 60), 'Deletion cadence differs from reference');
      check(near(0, 1, 445, 120), 'Between-role pause differs from reference');

      check(await page.locator('.prism-role-text').evaluate(el => getComputedStyle(el).borderBottomWidth) === '2px', 'Role underline missing');
      const after = await page.locator('#hero').evaluate(el => el.getBoundingClientRect().height);
      check(Math.abs(before - after) < 1, `Hero height shifted at ${width}: ${before} to ${after}`);
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Hero overflows');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(100);
      check(await name.textContent() === realName, 'Reduced-motion name is animated');
      check(await page.locator('.prism-role-text').textContent() === profile.designation, 'Reduced-motion designation is not primary');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      const pause = page.getByRole('button', { name: 'Pause motion', exact: true });
      await pause.click();
      check(await page.locator('.prism-role-text').textContent() === profile.designation, 'Paused designation is not primary');
      const nojs = await page.context().browser().newContext({ javaScriptEnabled: false, storageState: await page.context().storageState(), viewport: { width, height: 844 } });
      const fallback = await nojs.newPage();
      await fallback.goto(origin + '/preview/prism', { waitUntil: 'networkidle' });
      check(await fallback.locator('.prism-role-text').textContent() === profile.designation, 'No-JS designation is not primary');
      check(await fallback.locator('#prism-hero-title .prism-scramble-layer').textContent() === realName, 'No-JS name differs');
      await nojs.close();
      reports.push({ width, heroAnimation: 'passed', samples, events });
    }
  return reports;
}
