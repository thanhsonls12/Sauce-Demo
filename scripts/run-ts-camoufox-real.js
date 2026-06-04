const { spawnSync } = require('node:child_process');
const { loadDotenv } = require('./lib/dotenv');
const { hasValidCloudflareSession, storageStatePath } = require('./lib/storage-state');

loadDotenv();

const userArgs = process.argv.slice(2);
const hasExplicitTarget = userArgs.some((arg) => !arg.startsWith('-'));
const hasExplicitProject = userArgs.some(
  (arg) => arg === '--project' || arg.startsWith('--project=')
);
const runsRealTests =
  !hasExplicitTarget ||
  userArgs.some((arg) => !arg.startsWith('-') && arg.replace(/\\/g, '/').includes('tests/real'));
const testArgs = ['playwright', 'test'];

if (!process.argv.includes('--list') && runsRealTests && !hasValidCloudflareSession()) {
  console.error(
    [
      `[test:real] Missing valid cf_clearance in ${storageStatePath()}.`,
      'Run `npm run auth:save:camoufox`, solve Cloudflare/hCaptcha if shown, then retry.',
    ].join('\n')
  );
  process.exit(1);
}

if (!hasExplicitTarget) {
  testArgs.push('tests/real');
}

if (!hasExplicitProject) {
  testArgs.push(runsRealTests ? '--project=real' : '--project=chromium');
}

testArgs.push(...userArgs);

const result = spawnSync('npx', testArgs, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PLAYWRIGHT_CAMOUFOX: '1',
    PLAYWRIGHT_SKIP_AUTH_SETUP: '1',
    PLAYWRIGHT_VIDEO: process.env.PLAYWRIGHT_VIDEO || (runsRealTests ? 'on' : 'retain-on-failure'),
    PLAYWRIGHT_SCREENSHOT:
      process.env.PLAYWRIGHT_SCREENSHOT || (runsRealTests ? 'on' : 'only-on-failure'),
    CAMOUFOX_HEADLESS: process.env.CAMOUFOX_HEADLESS || '0',
    CAMOUFOX_TS_WAIT_FOR_ENTER: process.env.CAMOUFOX_TS_WAIT_FOR_ENTER || '0',
  },
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
