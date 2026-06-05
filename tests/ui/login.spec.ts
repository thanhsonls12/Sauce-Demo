import { test } from '@/fixtures/page.fixture';

test.describe('Trang login @real', () => {
  test('LOGIN-001: các trường form login hiển thị', async ({ loginPage }) => {
    await loginPage.goTo();

    await loginPage.expectLoaded();
    await loginPage.expectLoginFormVisible();
  });

  test('LOGIN-002: người dùng nhập được email và mật khẩu', async ({ loginPage }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.fillLoginForm('test@example.com', '123456');

    await loginPage.expectEmailValue('test@example.com');
    await loginPage.expectPasswordValue('123456');
  });

  test('LOGIN-003: người dùng xóa được email đã nhập', async ({ loginPage }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.fillEmail('test@example.com');
    await loginPage.expectEmailValue('test@example.com');

    await loginPage.clearEmail();

    await loginPage.expectEmailValue('');
  });

  test('LOGIN-004: khu vực quên mật khẩu hiển thị', async ({ loginPage }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.expectForgotPasswordVisible();
  });

  test('LOGIN-005: login sai không login được và báo lỗi', async ({ loginPage }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.fillLoginForm('wrong@example.com', 'wrong-password');
    await loginPage.submitLoginForm();

    await loginPage.expectInvalidLoginError();
  });

  test('LOG-VAL-001: login với empty email field hiển thị validation error', async ({
    loginPage,
  }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.fillPassword('password123');
    await loginPage.submitLoginForm();

    await loginPage.expectEmailValue('');
    await loginPage.expectEmailRequiredError();
  });

  test('LOG-VAL-002: login với empty password field hiển thị validation error', async ({
    loginPage,
  }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.fillEmail('test@example.com');
    await loginPage.submitLoginForm();

    await loginPage.expectPasswordValue('');
    await loginPage.expectPasswordRequiredError();
  });

  test('LOG-VAL-003: login với invalid email format hiển thị validation error', async ({
    loginPage,
  }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    // Test missing @ symbol
    await loginPage.fillLoginForm('invalidemail.com', 'password123');
    await loginPage.submitLoginForm();
    await loginPage.expectInvalidEmailFormatError();

    // Test invalid domain
    await loginPage.clearEmail();
    await loginPage.fillLoginForm('test@invalid', 'password123');
    await loginPage.submitLoginForm();
    await loginPage.expectInvalidEmailFormatError();

    // Test missing domain
    await loginPage.clearEmail();
    await loginPage.fillLoginForm('test@', 'password123');
    await loginPage.submitLoginForm();
    await loginPage.expectInvalidEmailFormatError();
  });

  test('LOG-VAL-004: login với password quá ngắn hiển thị validation error', async ({
    loginPage,
  }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.fillLoginForm('test@example.com', '123');
    await loginPage.submitLoginForm();

    await loginPage.expectPasswordTooShortError();
  });
});
