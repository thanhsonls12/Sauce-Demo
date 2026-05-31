import { mkdirSync } from 'node:fs';
import path from 'node:path';
import {
  test as base,
  expect,
  type Browser,
  type BrowserContext,
  type Page,
} from '@playwright/test';
import { chromium } from 'playwright';

import { storageStatePath } from '@/config/storage';
import { timeouts } from '@/config/timeouts';
import { waitForCloudflare } from './cloudflare';
import {
  useCamoufox,
  camoufoxCloseDelayMs,
  keepCamoufoxOpenUntilEnter,
  launchCamoufoxServer,
  killProcessTree,
} from './camoufox';

import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ProductPage } from '@/pages/ProductPage';
import { CartPage } from '@/pages/CartPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { SearchPage } from '@/pages/SearchPage';
import { AboutPage } from '@/pages/AboutPage';
import { BlogPage } from '@/pages/BlogPage';
import { CheckoutPage } from '@/pages/CheckoutPage';

type PageFixtures = {
  page: Page;
  context: BrowserContext;
  homePage: HomePage;
  catalogPage: CatalogPage;
  productPage: ProductPage;
  cartPage: CartPage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  searchPage: SearchPage;
  aboutPage: AboutPage;
  blogPage: BlogPage;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<PageFixtures, { browser: Browser }>({
  context: async ({ context }, use) => {
    await context.addInitScript(() => {
      if (!Object.getOwnPropertyDescriptor(navigator, 'deviceMemory')) {
        Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
      }
      if (!Object.getOwnPropertyDescriptor(navigator, 'hardwareConcurrency')) {
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      }
      Object.defineProperty(navigator, 'connection', {
        get: () => ({
          downlink: 10,
          effectiveType: '4g',
          onchange: null,
          rtt: 50,
          saveData: false,
        }),
      });
    });

    await use(context);

    if (useCamoufox) {
      mkdirSync(path.dirname(storageStatePath), { recursive: true });
      await context
        .storageState({ path: storageStatePath })
        .catch((e) => console.warn('[camoufox] storageState failed:', e));
      await context.close().catch((e) => console.warn('[camoufox] context.close failed:', e));
    }
  },

  browser: [
    async ({ browserName, launchOptions }, use) => {
      if (useCamoufox) {
        const server = await launchCamoufoxServer();
        try {
          await use(server.browser);
        } finally {
          if (keepCamoufoxOpenUntilEnter) {
            process.stdout.write(
              '[test:real:camoufox:ts] Tests finished. Press ENTER to close Camoufox...'
            );
            await new Promise<void>((resolve) => {
              process.stdin.resume();
              process.stdin.once('data', () => resolve());
            });
          } else {
            await new Promise((resolve) => setTimeout(resolve, camoufoxCloseDelayMs));
          }
          await server.browser
            .close()
            .catch((e) => console.warn('[camoufox] browser.close failed:', e));
          killProcessTree(server.process);
        }
        return;
      }

      if (browserName !== 'chromium') {
        throw new Error('Custom chromium fixture currently supports only chromium.');
      }
      const browser = await chromium.launch(launchOptions);
      await use(browser);
      await browser.close();
    },
    { scope: 'worker' },
  ],

  page: async ({ page }, use) => {
    const _goto = page.goto.bind(page);
    page.goto = async (url: string, options?: Parameters<Page['goto']>[1]) => {
      const response = await _goto(url, options);
      await waitForCloudflare(page);
      return response;
    };

    const _reload = page.reload.bind(page);
    page.reload = async (options?: Parameters<Page['reload']>[0]) => {
      const response = await _reload({
        waitUntil: 'domcontentloaded',
        timeout: timeouts.load,
        ...options,
      }).catch(async (error) => {
        if (!String(error).includes('Timeout')) {
          throw error;
        }

        await page.waitForLoadState('domcontentloaded', { timeout: timeouts.element }).catch(() => {});
        return null;
      });
      await waitForCloudflare(page);
      return response;
    };

    await use(page);
  },

  homePage: async ({ page }, use) => { await use(new HomePage(page)); },
  catalogPage: async ({ page }, use) => { await use(new CatalogPage(page)); },
  productPage: async ({ page }, use) => { await use(new ProductPage(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  registerPage: async ({ page }, use) => { await use(new RegisterPage(page)); },
  searchPage: async ({ page }, use) => { await use(new SearchPage(page)); },
  aboutPage: async ({ page }, use) => { await use(new AboutPage(page)); },
  blogPage: async ({ page }, use) => { await use(new BlogPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },
});

export { expect };
