import { test } from '@/fixtures/page.fixture';
import {
  recordRegisteredAccount,
  recordRegistrationAttempt,
} from '@/tests/support/account-records';

test.describe('Luồng register thật @real @e2e @mutation', () => {
  test('REAL-REGISTER-001: register từ navbar và ghi lại tài khoản khi thành công', async ({
    homePage,
    registerPage,
  }, testInfo) => {
    const email = `register-${Date.now()}@example.com`;
    const password = 'Password123!';

    await homePage.goTo();
    await homePage.expectLoaded();

    if (await homePage.logoutLinkIsVisible()) {
      await homePage.logout();
      await homePage.goTo();
      await homePage.expectLoaded();
    }

    await homePage.goToRegister();

    await registerPage.expectLoaded();
    await registerPage.expectRegisterFormVisible();

    await registerPage.fillRegisterForm(
      'Test',
      'User',
      email,
      password
    );
    await registerPage.submitRegisterForm();

    if (await registerPage.accountCreated()) {
      const accountPath = recordRegisteredAccount({
        email,
        password,
        source: 'REAL-REGISTER-001',
        createdAt: new Date().toISOString(),
      });
      recordRegistrationAttempt({
        email,
        source: 'REAL-REGISTER-001',
        status: 'created',
        url: registerPage.currentUrl(),
        createdAt: new Date().toISOString(),
      });
      await testInfo.attach('registered-account.json', {
        body: JSON.stringify({ email, password, path: accountPath }, null, 2),
        contentType: 'application/json',
      });
      await homePage.logout();
      return;
    }

    const attemptPath = recordRegistrationAttempt({
      email,
      source: 'REAL-REGISTER-001',
      status: 'protected',
      url: registerPage.currentUrl(),
      createdAt: new Date().toISOString(),
    });
    await testInfo.attach('registration-attempt.json', {
      body: JSON.stringify({ email, status: 'protected', url: registerPage.currentUrl(), path: attemptPath }, null, 2),
      contentType: 'application/json',
    });

    await registerPage.expectRegisterProtected();
  });

  test('REAL-REGISTER-002: register bằng email đã tồn tại bị từ chối', async ({
    registerPage,
  }) => {
    const email = process.env.SHOPIFY_TEST_EMAIL;
    const password = process.env.SHOPIFY_TEST_PASSWORD ?? 'Password123!';

    test.skip(!email, 'Set SHOPIFY_TEST_EMAIL to an existing customer email.');

    await registerPage.goTo();
    await registerPage.expectLoaded();

    await registerPage.fillRegisterForm('Existing', 'User', email!, password);
    await registerPage.submitRegisterForm();

    await registerPage.expectExistingEmailError();
    await registerPage.expectLoaded();
  });
});
