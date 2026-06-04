import { test } from '@/fixtures/page.fixture';
import { timeouts } from '@/config/timeouts';

test.describe('Trang register @real', () => {
  test.describe.configure({ timeout: timeouts.realTest });

  test('REGISTER-001: các trường form register hiển thị', async ({ registerPage }) => {
    await registerPage.goTo();

    await registerPage.expectLoaded();
    await registerPage.expectRegisterFormVisible();
  });

  test('REGISTER-002: người dùng nhập được form register', async ({ registerPage }) => {
    await registerPage.goTo();
    await registerPage.expectLoaded();

    await registerPage.fillRegisterForm('Test', 'User', 'test@example.com', 'Password123!');

    await registerPage.expectRegisterFormValues('Test', 'User', 'test@example.com', 'Password123!');
  });

  test('REGISTER-003: người dùng xóa được dữ liệu đã nhập', async ({ registerPage }) => {
    await registerPage.goTo();
    await registerPage.expectLoaded();

    await registerPage.fillRegisterForm('Test', 'User', 'test@example.com', 'Password123!');
    await registerPage.clearRegisterForm();

    await registerPage.expectRegisterFormValues('', '', '', '');
  });

  test('AUTH-VAL-004: Register với empty password field hiển thị validation error', async ({
    registerPage,
  }) => {
    await registerPage.goTo();
    await registerPage.expectLoaded();

    await registerPage.fillRegisterForm('Test', 'User', `test-${Date.now()}@example.com`, '');
    await registerPage.submitRegisterForm();

    await registerPage.expectLoaded();
    await registerPage.expectPasswordRequiredError();
  });

  test('AUTH-VAL-006: Register với weak password hiển thị validation error', async ({
    registerPage,
  }) => {
    await registerPage.goTo();
    await registerPage.expectLoaded();

    await registerPage.fillRegisterForm('Test', 'User', `test-${Date.now()}@example.com`, '1234');
    await registerPage.submitRegisterForm();

    await registerPage.expectLoaded();
    await registerPage.expectPasswordTooShortError();
  });

  test('AUTH-VAL-007: Register với invalid email format hiển thị validation error', async ({
    registerPage,
  }) => {
    await registerPage.goTo();
    await registerPage.expectLoaded();

    await registerPage.fillRegisterForm('Test', 'User', 'missing@domain', 'Password123!');
    await registerPage.submitRegisterForm();

    await registerPage.expectLoaded();
    await registerPage.expectInvalidEmailError();
  });
});
