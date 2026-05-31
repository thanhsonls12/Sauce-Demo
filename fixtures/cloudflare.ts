import { type Page } from '@playwright/test';
import { timeouts } from '@/config/timeouts';

const CF_TITLES = ['Just a moment', 'Attention Required!', 'Please wait…'];

function isCFChallengePage(title: string): boolean {
  return CF_TITLES.some((t) => title.includes(t));
}

export async function waitForCloudflare(page: Page): Promise<void> {
  const title = await page.title().catch(() => '');
  if (!isCFChallengePage(title)) return;

  const resolved = await page
    .waitForFunction(
      (cfTitles: string[]) => !cfTitles.some((t) => document.title.includes(t)),
      CF_TITLES,
      { timeout: timeouts.cloudflare }
    )
    .then(() => true)
    .catch(() => false);

  if (!resolved) {
    throw new Error(
      `Cloudflare challenge ("${title}") không tự giải quyết sau 25 s.\n` +
        'Session cf_clearance đã hết hạn hoặc chưa có.\n' +
        'Chạy: npm run auth:save:camoufox  →  rồi thử lại.'
    );
  }

  await page.waitForLoadState('load', { timeout: timeouts.load }).catch(() => {});
}
