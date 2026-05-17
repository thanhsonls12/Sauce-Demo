import { test } from '@/fixtures/page.fixture';

test.describe('Login page', () => {
  test('LOGIN-002: login form fields hiển thị', async ({ loginPage }) => {
    await loginPage.goTo();

    await loginPage.expectLoaded();
    await loginPage.expectLoginFormVisible();
  });

  test('LOGIN-003: người dùng nhập được email và password', async ({ loginPage }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.fillLoginForm('test@example.com', '123456');

    await loginPage.expectEmailValue('test@example.com');
    await loginPage.expectPasswordValue('123456');
  });

  test('LOGIN-004: người dùng xóa được email đã nhập', async ({ loginPage }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.fillEmail('test@example.com');
    await loginPage.expectEmailValue('test@example.com');

    await loginPage.clearEmail();

    await loginPage.expectEmailValue('');
  });

  test('LOGIN-005: forgot password section hiển thị', async ({ loginPage }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.expectForgotPasswordVisible();
  });

  test('LOGIN-006: login sai không đăng nhập và hiển thị bảo vệ hCaptcha', async ({
    loginPage,
  }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.fillLoginForm('wrong@example.com', 'wrong-password');
    await loginPage.submitLoginForm();

    await loginPage.expectInvalidLoginProtected();
  });
});
