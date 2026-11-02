async page => {
  // Run against an isolated copy with synthetic admin credentials on port 3036.
  const origin = 'http://127.0.0.1:3036';
  const login = await page.context().request.post(`${origin}/admin/session`, {
    form: { password: 'prism-browser-password' }, headers: { origin }, maxRedirects: 0,
  });
  if (!login.headers().location?.endsWith('/admin/theme')) throw new Error('Preview login failed');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const reports = [];
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${origin}/preview/prism`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.prism-root[data-motion="on"]').waitFor();
    await page.locator('.prism-marquee').scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const rows = await page.locator('.prism-marquee-track').evaluateAll(tracks => tracks.map(track => {
      const animation = track.getAnimations()[0];
      animation.pause();
      animation.currentTime = 10000;
      const before = track.getBoundingClientRect().x;
      animation.currentTime = 11000;
      const delta = track.getBoundingClientRect().x - before;
      const icon = track.querySelector('svg');
      const result = {
        delta, duration: getComputedStyle(track).animationDuration,
        iconWidth: icon.getBoundingClientRect().width,
        iconTransform: getComputedStyle(icon).transform,
        backface: getComputedStyle(icon).backfaceVisibility,
        copies: [...track.children].map(child => child.getBoundingClientRect().width),
      };
      animation.play();
      return result;
    }));
    if (!(rows[0].delta > 0 && rows[1].delta < 0)) throw new Error('Wrong scrolling directions');
    if (rows.some(row => row.duration !== '60s' || row.iconWidth !== 20 || row.iconTransform === 'none' || row.backface !== 'hidden' || Math.abs(row.copies[0] - row.copies[1]) > .01)) throw new Error('Unstable icon or loop geometry');
    await page.evaluate(async () => {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await Promise.all(document.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {})));
    });
    const timing = await page.evaluate(async () => {
      const times = [];
      await new Promise(resolve => {
        const start = performance.now();
        const frame = time => { times.push(time); if (time - start < 3000) requestAnimationFrame(frame); else resolve(); };
        requestAnimationFrame(frame);
      });
      const gaps = times.slice(1).map((time, index) => time - times[index]);
      return { frames: times.length, longFrames: gaps.filter(gap => gap > 25).length, maxGap: Math.max(...gaps) };
    });
    await page.locator('.prism-marquee').screenshot({ path: `/tmp/prism-smooth-${width}.png` });
    reports.push({ width, rows, timing });
  }
  const track = page.locator('.prism-marquee-track').first();
  const rect = await track.boundingBox();
  await page.mouse.move(100, rect.y + rect.height / 2);
  if (await track.evaluate(el => getComputedStyle(el).animationPlayState) !== 'paused') throw new Error('Hover pause failed');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  if (await track.evaluate(el => getComputedStyle(el).animationName) !== 'none') throw new Error('Reduced motion failed');
  return { reports, hoverPause: true, reducedMotion: true };
}
