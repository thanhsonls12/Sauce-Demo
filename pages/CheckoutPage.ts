import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly zipInput: Locator;
  readonly phoneInput: Locator;

  readonly payNowBtn: Locator;

  constructor(page: Page) {
    super(page);

    this.emailInput = page.getByPlaceholder(/Email/i).or(page.getByLabel(/Email/i)).first();
    this.firstNameInput = page
      .getByPlaceholder(/First name/i)
      .or(page.getByLabel(/First name/i))
      .first();
    this.lastNameInput = page
      .getByPlaceholder(/Last name/i)
      .or(page.getByLabel(/Last name/i))
      .first();
    this.addressInput = page
      .getByPlaceholder(/Address/i)
      .or(page.getByLabel(/Address/i))
      .first();
    this.cityInput = page.getByPlaceholder(/City/i).or(page.getByLabel(/City/i)).first();
    this.zipInput = page
      .getByPlaceholder(/Postal code|ZIP/i)
      .or(page.getByLabel(/Postal code/i))
      .first();
    this.phoneInput = page.getByPlaceholder(/Phone/i).or(page.getByLabel(/Phone/i)).first();

    this.payNowBtn = page.getByRole('button', { name: /Pay now/i });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/checkouts/);
  }

  async fillShippingAddress(info: {
    firstName?: string;
    lastName: string;
    address: string;
    city: string;
    zip: string;
    phone?: string;
  }) {
    if (info.firstName) {
      if (await this.firstNameInput.isVisible()) {
        await this.firstNameInput.fill(info.firstName);
      }
    }

    await this.lastNameInput.fill(info.lastName);
    await this.addressInput.fill(info.address);
    await this.cityInput.fill(info.city);
    await this.zipInput.fill(info.zip);

    if (info.phone) {
      if (await this.phoneInput.isVisible()) {
        await this.phoneInput.fill(info.phone);
      }
    }
  }

  async payNow() {
    await this.payNowBtn.click();
  }
}
