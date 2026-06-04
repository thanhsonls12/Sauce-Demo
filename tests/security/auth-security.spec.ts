import type { Page } from '@playwright/test';
import { expect, test } from '@/fixtures/page.fixture';

const securityPayloads = {
  sql: "' OR '1'='1",
  xss: '<script>alert("XSS")</script>',
  html: '<b>test</b>',
} as const;

const securityEmailPayloads = Object.values(securityPayloads);

test.describe('Authentication Security Tests @real @security', () => {
  test.setTimeout(120_000);

  test('AUTH-SEC-001: login coi SQLi, XSS, HTML injection trong email như text thường', async ({
    page,
    loginPage,
  }) => {
    const dialogs = await collectDialogs(page);

    for (const payload of securityEmailPayloads) {
      await expectLoginRejectsEmailPayload(page, loginPage, payload, { waitForDialog: true });
    }

    expect(dialogs).toEqual([]);
  });

  test('AUTH-SEC-002: register reject SQLi, XSS, HTML injection trong email', async ({
    page,
    registerPage,
  }) => {
    const dialogs = await collectDialogs(page);

    for (const payload of securityEmailPayloads) {
      await expectRegisterRejectsEmailPayload(page, registerPage, payload, { waitForDialog: true });
    }

    expect(dialogs).toEqual([]);
  });

  test('AUTH-SEC-003: register phải reject email local-part chỉ là ký tự đặc biệt', async ({
    page,
    registerPage,
  }) => {
    await expectRegisterRejectsEmailPayload(page, registerPage, '!@domainn.com');
  });

  test('AUTH-SEC-004: login phải reject email local-part chỉ là ký tự đặc biệt', async ({
    page,
    loginPage,
  }) => {
    await loginPage.goTo();
    await loginPage.expectLoaded();

    await loginPage.fillLoginForm('!@domainn.com', 'Password123!');
    await loginPage.submitLoginForm();

    await expect(page.getByText(/email is invalid/i)).toBeVisible({ timeout: 5000 });
    expect(await loginPage.accountIsLoaded()).toBe(false);
    await expect(page).not.toHaveURL(/\/account\/?$/);
  });
});

async function expectLoginRejectsEmailPayload(
  page: Page,
  loginPage,
  payload: string,
  options: { waitForDialog?: boolean } = {}
) {
  await loginPage.goTo();
  await loginPage.expectLoaded();
  await forceEmailInputToText(page);

  await loginPage.fillEmail(payload);
  await loginPage.fillPassword('password123');
  await loginPage.submitLoginForm();

  if (options.waitForDialog) {
    await page.waitForTimeout(1000);
  }

  await loginPage.expectInvalidLoginError();
  expect(await loginPage.accountIsLoaded()).toBe(false);
  await expect(page).not.toHaveURL(/\/account\/?$/);
}

async function expectRegisterRejectsEmailPayload(
  page: Page,
  registerPage,
  payload: string,
  options: { waitForDialog?: boolean } = {}
) {
  await registerPage.goTo();
  await registerPage.expectLoaded();
  await forceEmailInputToText(page);

  await registerPage.fillRegisterForm('Security', 'Test', payload, 'Password123!');
  await registerPage.submitRegisterForm();

  if (options.waitForDialog) {
    await page.waitForTimeout(1000);
  }

  await expect(page.getByText(/email is invalid/i)).toBeVisible({ timeout: 5000 });
  expect(await registerPage.accountCreated()).toBe(false);
  await expect(page).not.toHaveURL(/\/account\/?$/);
}

async function forceEmailInputToText(page: Page) {
  await page.locator('input[name="customer[email]"]').evaluate((input: HTMLInputElement) => {
    input.type = 'text';
  });
}

async function collectDialogs(page: Page) {
  const dialogs: string[] = [];

  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });

  return dialogs;
}
