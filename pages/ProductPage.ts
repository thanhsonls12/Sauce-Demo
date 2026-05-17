import { expect, type Locator, type Page } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly soldOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    this.soldOutButton = page.getByRole('button', { name: 'Sold Out' });
  }

  async goTo(slug: string) {
    await this.page.goto(`/products/${slug}`);
  }

  heading(productName: string) {
    return this.page.getByRole('heading', { name: productName });
  }

  price(price: string) {
    return this.page.getByText(price, { exact: true });
  }

  async expectProductUrl(slug: string | RegExp) {
    await expect(this.page).toHaveURL(slug);
  }

  async expectProductVisible(name: string, price: string) {
    await expect(this.heading(name)).toBeVisible();
    await expect(this.price(price)).toBeVisible();
  }

  async expectProductNameVisible(name: string) {
    await expect(this.heading(name)).toBeVisible();
  }

  async expectProductPriceVisible(price: string) {
    await expect(this.price(price)).toBeVisible();
  }

  async addToCart() {
    const addToCartResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes('/cart/add.js') && response.request().method() === 'POST'
    );
    const cartResponse = this.page.waitForResponse(
      (response) => response.url().includes('/cart.js') && response.request().method() === 'GET'
    );

    await this.addToCartButton.click();
    await addToCartResponse;
    await cartResponse;
  }

  async expectAddToCartVisible() {
    await expect(this.addToCartButton).toBeVisible();
    await expect(this.addToCartButton).toBeEnabled();
  }

  async expectSoldOutVisible() {
    await expect(this.soldOutButton).toBeVisible();
    await expect(this.soldOutButton).toBeDisabled();
  }
}
