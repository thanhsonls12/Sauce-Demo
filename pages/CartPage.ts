import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '@/test-data/routes';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly heading: Locator;
  readonly emptyCartMessage: Locator;
  readonly continueShoppingLink: Locator;
  readonly removeItemLink: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = page.getByRole('heading', { name: 'My Cart' });
    this.emptyCartMessage = page.getByText('It appears that your cart is currently empty!');
    this.continueShoppingLink = page.getByRole('link', { name: 'Continue Shopping' });
    this.removeItemLink = page.getByRole('link', { name: 'x' });
    this.checkoutButton = page.getByRole('button', { name: 'Check Out' });
  }

  async goTo() {
    await this.page.goto(routes.cart);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/cart/);
    await expect(this.heading).toBeVisible();
  }

  async expectCartEmpty() {
    await expect(this.emptyCartMessage).toBeVisible();
  }

  async continueShopping() {
    await this.continueShoppingLink.click();
  }

  async expectHeaderCartCount(count: number) {
    await expect(
      this.page.getByRole('banner').getByRole('link', { name: `My Cart (${count})` })
    ).toBeVisible();
  }

  async expectProductVisible(name: string, price: string) {
    await expect(this.page.getByRole('heading', { name: new RegExp(name, 'i') })).toBeVisible();
    await expect(this.page.getByText(normalizePrice(price), { exact: true }).filter({ visible: true }).first()).toBeVisible();
  }

  async expectQuantity(quantity: string) {
    await expect(this.page.getByRole('textbox').first()).toHaveValue(quantity);
  }

  async expectQuantities(quantities: readonly string[]) {
    const quantityInputs = this.page.getByRole('textbox');

    for (let index = 0; index < quantities.length; index += 1) {
      await expect(quantityInputs.nth(index)).toHaveValue(quantities[index]);
    }
  }

  async expectTotal(total: string) {
    await expect(this.page.getByRole('heading', { name: `Total ${total}` })).toBeVisible();
  }

  async removeFirstItem() {
    await this.removeItemLink.click();
  }

  async expectCheckoutButtonVisible() {
    await expect(this.checkoutButton).toBeVisible();
    await expect(this.checkoutButton).toBeEnabled();
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}

function normalizePrice(price: string) {
  return price.replace('\u00c2£', '£');
}
