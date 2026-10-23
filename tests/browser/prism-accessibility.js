async (page) => {
  const origin = "http://127.0.0.1:3025";
  const reports = [];
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 960 });
    for (const mode of ["dark", "light"]) {
      await page.goto(`${origin}/preview/prism`, { waitUntil: "networkidle" });
      if (await page.locator('.prism-root').getAttribute('data-color') !== mode) await page.getByRole('button', { name: 'Toggle color theme' }).click();
      const pause = page.getByRole('button', { name: 'Pause motion', exact: true });
      if (await pause.count()) await pause.click();
      await page.waitForTimeout(700);
      await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
      const result = await page.evaluate(async () => {
        return await window.axe.run(document.querySelector('.theme-prism'), {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
        });
      });
      reports.push({ width, mode, violations: result.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })) })) });
    }
  }
  return reports;
}
