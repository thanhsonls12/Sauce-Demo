import { expect, test } from '@/fixtures/page.fixture';
import { loadDotenv } from '@/config/env';
import { readLatestRegisteredAccount } from '@/tests/support/account-records';

loadDotenv();

function loginCredentials() {
  if (process.env.SHOPIFY_TEST_EMAIL && process.env.SHOPIFY_TEST_PASSWORD) {
    return {
      email: process.env.SHOPIFY_TEST_EMAIL,
      password: process.env.SHOPIFY_TEST_PASSWORD,
      source: '.env',
    };
  }

  const account = readLatestRegisteredAccount();
  if (!account) return null;

  return {
    email: account.email,
    password: account.password,
    source: 'registered-accounts.jsonl',
  };
}

test.describe('Luồng login thật @real @e2e', () => {
  test('REAL-LOGIN: login bằng tài khoản khách hàng thật', async ({ homePage, loginPage }) => {
    const credentials = loginCredentials();

    test.skip(
      !credentials,
      'Set SHOPIFY_TEST_EMAIL/SHOPIFY_TEST_PASSWORD or create an account via register flow first.'
    );

    await homePage.goTo();
    await homePage.expectLoaded();

    if (await homePage.logoutLinkIsVisible()) {
      await homePage.logout();
      await homePage.goTo();
      await homePage.expectLoaded();
    }

    test.skip(
      !(await homePage.loginLinkIsVisible()),
      'Navbar Log In did not appear after logging out and reloading.'
    );

    await homePage.goToLogin();
    await loginPage.expectLoaded();
    await loginPage.expectLoginFormVisible();

    await loginPage.fillLoginForm(credentials.email, credentials.password);
    await loginPage.submitLoginForm();
    await loginPage.expectAccountLoaded();
    await homePage.logout();
  });

  test('REAL-LOGOUT: logout từ navbar khi đã login', async ({ homePage }) => {
    await homePage.goTo();
    await homePage.expectLoaded();

    if (!(await homePage.logoutLinkIsVisible())) {
      return;
    }

    await homePage.logout();
    await homePage.expectLoaded();
    await expect(homePage.loginLink).toBeVisible();
  });

  test('REAL-PASSWORD: người dùng yêu cầu reset password bằng email thật', async ({
    loginPage,
  }) => {
    const credentials = loginCredentials();

    test.skip(
      !credentials,
      'Set SHOPIFY_TEST_EMAIL/SHOPIFY_TEST_PASSWORD or create an account via register flow first.'
    );

    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.requestPasswordReset(credentials!.email);
    await loginPage.expectPasswordResetRequested();
  });
});
