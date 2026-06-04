import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '@/test-data/routes';
import { BasePage } from './BasePage';
import { timeouts } from '@/config/timeouts';

export class LoginPage extends BasePage {
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly forgotPasswordText: Locator;
  readonly resetPasswordHeading: Locator;
  readonly resetEmailInput: Locator;
  readonly loginForm: Locator;
  readonly signInButton: Locator;
  readonly hcaptchaText: Locator;
  readonly invalidLoginError: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = page.getByRole('heading', { name: 'Customer Login' });
    this.loginForm = page.locator('form[action$="/account/login"]');
    this.emailInput = page.getByLabel('Email Address');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = this.loginForm.locator('input[type="submit"]');
    this.forgotPasswordText = page.getByText('Forgot your password?');
    this.resetPasswordHeading = page.getByRole('heading', { name: 'Reset Password' });
    this.resetEmailInput = page.locator('#recover-email');
    this.hcaptchaText = page.getByText('Protected by hCaptcha').first();
    this.invalidLoginError = page.getByText(/incorrect email or password/i);
  }

  async goTo() {
    await this.page.goto(routes.login);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/account\/login/);
    await expect(this.heading).toBeVisible();
  }

  async expectLoginFormVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async fillLoginForm(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  async expectEmailValue(email: string) {
    await expect(this.emailInput).toHaveValue(email);
  }

  async expectPasswordValue(password: string) {
    await expect(this.passwordInput).toHaveValue(password);
  }

  async clearEmail() {
    await this.emailInput.press('Control+A');
    await this.emailInput.press('Backspace');
  }

  async expectForgotPasswordVisible() {
    await expect(this.forgotPasswordText).toBeVisible();
    await this.forgotPasswordText.click();
    await expect(this.resetPasswordHeading).toBeVisible();
    await expect(this.resetEmailInput).toBeVisible();
  }

  async submitLoginForm() {
    await this.signInButton.click();
    await this.page.waitForLoadState('domcontentloaded', { timeout: timeouts.navigation }).catch(() => {});
    if (await this.hcaptchaText.isVisible().catch(() => false)) {
      await this.page.waitForTimeout(15_000).catch(() => {});
      await this.page.waitForLoadState('domcontentloaded', { timeout: timeouts.navigation }).catch(() => {});
    }
  }

  async accountIsLoaded() {
    if (/\/account(?!\/login)/.test(this.page.url())) {
      return true;
    }

    return this.page
      .getByRole('heading', { name: 'Account Details and Order History' })
      .isVisible({ timeout: timeouts.quick })
      .catch(() => false);
  }

  async expectAccountLoaded() {
    const accountHeading = this.page.getByRole('heading', {
      name: 'Account Details and Order History',
    });
    try {
      await expect(accountHeading).toBeVisible({ timeout: timeouts.navigation });
    } catch (error) {
      if (await this.hcaptchaText.isVisible().catch(() => false)) {
        throw new Error(
          `hCaptcha is still visible after submitting login. Current URL: ${this.page.url()}`,
          { cause: error }
        );
      }

      throw new Error(`Account page did not load after login. Current URL: ${this.page.url()}`, {
        cause: error,
      });
    }
  }

  async expectInvalidLoginProtected() {
    await expect(this.page).toHaveURL(/account\/login/);
    await expect(this.hcaptchaText).toBeVisible();
  }

  async expectInvalidLoginError() {
    await expect(this.page).toHaveURL(/account\/login/);
    await expect(this.invalidLoginError).toBeVisible({ timeout: timeouts.navigation });
  }

  async expectEmailRequiredError() {
    await expect(this.page.getByText(/email is required/i)).toBeVisible({
      timeout: timeouts.navigation,
    });
  }

  async expectPasswordRequiredError() {
    await expect(this.page.getByText(/password is required/i)).toBeVisible({
      timeout: timeouts.navigation,
    });
  }

  async expectInvalidEmailFormatError() {
    await expect(this.page.getByText(/enter a valid email address/i)).toBeVisible({
      timeout: timeouts.navigation,
    });
  }

  async expectPasswordTooShortError() {
    await expect(this.page.getByText(/password must be at least/i)).toBeVisible({
      timeout: timeouts.navigation,
    });
  }
}
