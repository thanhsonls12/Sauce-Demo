import { defineConfig } from '@playwright/test';
import {
  browserLaunchArgs,
  screenshotMode,
  spoofedUserAgent,
  videoMode,
  viewport,
} from './config/browser';
import { loadDotenv } from './config/env';
import { guestStorageStatePath, storageStatePath } from './config/storage';
import { timeouts } from './config/timeouts';

loadDotenv();

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.ts',
  timeout: timeouts.test,
  retries: 0,
  workers: 1,
  reporter: 'html',

  use: {
    baseURL: 'https://sauce-demo.myshopify.com',
    trace: 'on-first-retry',
    screenshot: screenshotMode,
    video: videoMode,
    storageState: guestStorageStatePath,
    viewport,
    locale: 'en-US',
    launchOptions: { args: browserLaunchArgs },
  },

  projects: [
    {
      name: 'chromium',
      testIgnore: ['**/tests/real/**'],
      use: {
        channel: (process.env.PLAYWRIGHT_CHANNEL as 'chrome' | 'chromium') ?? 'chrome',
        userAgent: spoofedUserAgent,
        viewport,
        launchOptions: { args: browserLaunchArgs },
      },
    },
    {
      name: 'real',
      testMatch: ['**/tests/real/**'],
      timeout: timeouts.realTest,
      use: {
        channel: (process.env.PLAYWRIGHT_CHANNEL as 'chrome' | 'chromium') ?? 'chrome',
        storageState: storageStatePath,
        viewport,
        navigationTimeout: timeouts.navigation,
        launchOptions: {
          headless: false,
          args: browserLaunchArgs,
        },
      },
    },
  ],
});
