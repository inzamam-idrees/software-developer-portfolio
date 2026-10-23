// Run only against the isolated /tmp/prism-review-data server on port 3025.
async (page) => {
  const origin = 'http://127.0.0.1:3025';
  const check = (value, message) => { if (!value) throw new Error(message); };
  await page.goto(origin + '/admin/content/certificates', { waitUntil: 'networkidle' });
  const title = await page.locator('.admin-revision').getAttribute('title');
  let revision = title.replace(/^Revision /, '');
  const seed = [1, 2, 3].map((i) => ({ id: `placeholder-${i}`, title: `[TODO: certificate ${i} name]`, issuer: '[TODO: issuing organization]' }));
  const save = (data) => page.request.post(origin + '/admin/content/certificates/save', {
    headers: { origin }, data: { data, expectedRevision: revision },
  });
  const invalid = await save([{ ...seed[0], credentialUrl: 'javascript:alert(1)' }]);
  check(invalid.status() === 422, 'Invalid credential URL was accepted');
  const empty = await save([]);
  check(empty.status() === 200, 'Empty certificate list did not save');
  revision = (await empty.json()).revision;
  try {
    await page.goto(origin + '/preview/prism', { waitUntil: 'networkidle' });
    check(await page.locator('#certificates').count() === 0, 'Empty certificate section was rendered');
    check(await page.locator('.prism-nav a[href="/#certificates"]').count() === 0, 'Empty certificate section still has navigation');
  } finally {
    const restore = await save(seed);
    check(restore.status() === 200, 'Temporary seed restore failed');
  }
  await page.goto(origin + '/preview/prism', { waitUntil: 'networkidle' });
  check(await page.locator('#certificates h3').count() === 3, 'Certificate placeholders did not restore');
  return { adminSave: 'passed', invalidUrl: 'rejected', emptySection: 'hidden', restored: 3, dataRoot: '/tmp/prism-review-data' };
}
