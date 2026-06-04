import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '@/test-data/routes';
import { BasePage } from './BasePage';
import { timeouts } from '@/config/timeouts';

export class RegisterPage extends BasePage {
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly createButton: Locator;
  readonly hcaptchaText: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = page.getByRole('heading', { name: 'Create Account' });
    this.firstNameInput = page.locator('input[name="customer[first_name]"]');
    this.lastNameInput = page.locator('input[name="customer[last_name]"]');
    this.emailInput = page.locator('input[name="customer[email]"]');
    this.passwordInput = page.locator('input[name="customer[password]"]');
    this.createButton = page.locator('form[action$="/account"] input[type="submit"]');
    this.hcaptchaText = page.getByText('Protected by hCaptcha').first();
  }

  async goTo() {
    await this.page.goto(routes.register);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/account\/register/);
    await expect(this.heading).toBeVisible();
  }

  async expectRegisterFormVisible() {
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.createButton).toBeVisible();
  }

  async fillRegisterForm(firstName: string, lastName: string, email: string, password: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async fillFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clearRegisterForm() {
    await this.firstNameInput.clear();
    await this.lastNameInput.clear();
    await this.emailInput.clear();
    await this.passwordInput.clear();
  }

  async expectRegisterFormValues(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) {
    await expect(this.firstNameInput).toHaveValue(firstName);
    await expect(this.lastNameInput).toHaveValue(lastName);
    await expect(this.emailInput).toHaveValue(email);
    await expect(this.passwordInput).toHaveValue(password);
  }

  async submitRegisterForm() {
    const navigation = this.page
      .waitForURL((url) => !/\/account\/register/.test(url.pathname), {
        timeout: timeouts.networkIdle,
      })
      .catch(() => null);
    await this.createButton.click();
    if (await this.hcaptchaText.isVisible().catch(() => false)) {
      await this.page.waitForTimeout(15_000).catch(() => {});
    }
    await navigation;
  }

  async accountCreated() {
    await this.page
      .waitForLoadState('domcontentloaded', { timeout: timeouts.load })
      .catch(() => {});
    await this.page
      .waitForLoadState('networkidle', { timeout: timeouts.networkIdle })
      .catch(() => {});

    const currentUrl = this.page.url();
    if (
      /\/account\/?$/.test(currentUrl) ||
      (/\/account/.test(currentUrl) && !/\/register/.test(currentUrl))
    ) {
      return true;
    }

    const accountHeadingVisible = await this.page
      .getByRole('heading', { name: 'Account Details and Order History' })
      .isVisible({ timeout: timeouts.quick })
      .catch(() => false);

    if (accountHeadingVisible) {
      return true;
    }

    const accountLinkVisible = await this.page
      .getByRole('banner')
      .getByRole('link', { name: 'MyAccount' })
      .isVisible({ timeout: timeouts.quick })
      .catch(() => false);

    const logoutLinkVisible = await this.page
      .getByRole('banner')
      .getByRole('link', { name: 'Log Out' })
      .isVisible({ timeout: timeouts.quick })
      .catch(() => false);

    if (accountLinkVisible && logoutLinkVisible) {
      return true;
    }

    return false;
  }

  async expectRegisterProtected() {
    await this.page
      .waitForLoadState('domcontentloaded', { timeout: timeouts.load })
      .catch(() => {});

    if (/\/account\/register/.test(this.page.url())) {
      await expect(this.hcaptchaText).toBeVisible();
      return;
    }

    await expect(this.page).toHaveURL(/https:\/\/sauce-demo\.myshopify\.com\/?$/);
  }

  async expectFirstNameRequiredError() {
    await expect(this.page.getByText(/first name can't be blank/i)).toBeVisible({
      timeout: timeouts.navigation,
    });
  }

  async expectLastNameRequiredError() {
    await expect(this.page.getByText(/last name can't be blank/i)).toBeVisible({
      timeout: timeouts.navigation,
    });
  }

  async expectEmailRequiredError() {
    await expect(this.page.getByText(/email can't be blank/i)).toBeVisible({
      timeout: timeouts.navigation,
    });
  }

  async expectInvalidEmailError() {
    await expect(this.page.getByText(/email is invalid/i)).toBeVisible({
      timeout: timeouts.navigation,
    });
  }

  async expectPasswordRequiredError() {
    await expect(this.page.getByText(/password can't be blank/i)).toBeVisible({
      timeout: timeouts.navigation,
    });
  }

  async expectPasswordTooShortError() {
    await expect(this.page.getByText(/password is too short \(minimum is 5 characters\)/i)).toBeVisible({
      timeout: timeouts.navigation,
    });
  }

  currentUrl() {
    return this.page.url();
  }
}
