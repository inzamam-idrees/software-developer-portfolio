import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { resetLocalAdminPassword } from '../../lib/admin/local-password-reset.mjs';
import { createAdminSession, verifyAdminSession, verifyPassword } from '../../lib/admin/auth.mjs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);

test('local reset preserves other settings, hashes password and rotates secret', async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'portfolio-password-'));
 try {
  await writeFile(path.join(root,'.env.local'),'# Owner settings\nSITE_URL=https://example.com\nPORTFOLIO_ADMIN_PASSWORD_HASH=old\nPORTFOLIO_ADMIN_SESSION_SECRET=old-secret\n');
  await resetLocalAdminPassword({root,password:'test-only-new-password',confirmation:'test-only-new-password'});
  const first=await readFile(path.join(root,'.env.local'),'utf8');
  assert.ok(first.includes('SITE_URL=https://example.com'));
  assert.ok(!first.includes('test-only-new-password'));
  const hash=first.match(/^PORTFOLIO_ADMIN_PASSWORD_HASH="(.*)"$/m)[1].replaceAll('\\$','$');
  assert.ok(await verifyPassword('test-only-new-password',hash));
  const probe = await exec(process.execPath, ['--input-type=module', '-e', `
    import env from '@next/env';
    import { verifyPassword } from './lib/admin/auth.mjs';
    env.loadEnvConfig(process.argv[1], true);
    if (!await verifyPassword('test-only-new-password', process.env.PORTFOLIO_ADMIN_PASSWORD_HASH)) process.exit(1);
  `, root], { env: { PATH: process.env.PATH, NODE_ENV: 'development' } });
  assert.equal(probe.stderr, '');
  const firstSecret = first.match(/^PORTFOLIO_ADMIN_SESSION_SECRET="(.*)"$/m)[1];
  const session = createAdminSession({ secret: firstSecret });
  assert.equal((await stat(path.join(root,'.env.local'))).mode & 0o777,0o600);
  await resetLocalAdminPassword({root,password:'second-test-password',confirmation:'second-test-password'});
  const second=await readFile(path.join(root,'.env.local'),'utf8');
  assert.notEqual(first.match(/^PORTFOLIO_ADMIN_SESSION_SECRET=.*$/m)[0],second.match(/^PORTFOLIO_ADMIN_SESSION_SECRET=.*$/m)[0]);
  assert.equal(second.match(/^PORTFOLIO_ADMIN_PASSWORD_HASH=/gm).length,1);
  const secondSecret = second.match(/^PORTFOLIO_ADMIN_SESSION_SECRET="(.*)"$/m)[1];
  assert.equal(verifyAdminSession(session, { secret: secondSecret }), null);
 } finally {await rm(root,{recursive:true,force:true});}
});
test('mismatched or short passwords never write settings',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'portfolio-password-'));
 try {
  await assert.rejects(resetLocalAdminPassword({root,password:'short',confirmation:'short'}));
  await assert.rejects(resetLocalAdminPassword({root,password:'test-only-password',confirmation:'different-password'}));
  await assert.rejects(readFile(path.join(root,'.env.local')),{code:'ENOENT'});
 }finally{await rm(root,{recursive:true,force:true});}
});
