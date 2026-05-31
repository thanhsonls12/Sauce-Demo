import { spawnSync } from 'node:child_process';
import { loadDotenv, envFlag } from './config/env';
import { ensureStorageFile, hasValidCloudflareSession, writeGuestStorageFile } from './config/storage';

loadDotenv();

function acquireSessionViaCamoufox() {
  console.log('[global-setup] Starting Camoufox auth because PLAYWRIGHT_AUTO_AUTH=1.\n');
  const result = spawnSync('python', ['scripts/auth-save-camoufox.py'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env },
  });

  if (result.error) {
    throw new Error(
      `[global-setup] Could not run Python: ${result.error.message}\n` +
        'Make sure Python is installed and available in PATH.'
    );
  }

  if (result.status !== 0) {
    throw new Error(
      '[global-setup] auth-save-camoufox.py failed.\n' +
        'Run manually: npm run auth:save:camoufox'
    );
  }
}

export default async function globalSetup() {
  ensureStorageFile();
  writeGuestStorageFile();

  if (process.env.PLAYWRIGHT_SKIP_AUTH_SETUP === '1') {
    console.log('[global-setup] PLAYWRIGHT_SKIP_AUTH_SETUP=1, skipping auth setup.');
    return;
  }

  if (hasValidCloudflareSession()) {
    console.log('[global-setup] Valid cf_clearance found, skipping auth setup.');
    return;
  }

  if (!envFlag('PLAYWRIGHT_AUTO_AUTH')) {
    console.warn('[global-setup] No valid cf_clearance found.');
    console.warn('[global-setup] Run `npm run auth:save:camoufox` if tests hit Cloudflare.');
    return;
  }

  if (process.env.CI) {
    throw new Error('PLAYWRIGHT_AUTO_AUTH=1 is not supported in CI. Provide storageState instead.');
  }

  acquireSessionViaCamoufox();
  writeGuestStorageFile();
}
