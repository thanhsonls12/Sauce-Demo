import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly addToCartButton: Locator;
  readonly soldOutButton: Locator;
  readonly sizeSelect: Locator;
  readonly colorSelect: Locator;
  readonly variantSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
    this.soldOutButton = page.getByRole('button', { name: 'Sold Out' });
    this.sizeSelect = page.locator('#product-select-option-0');
    this.colorSelect = page.locator('#product-select-option-1');
    this.variantSelect = page.locator('#product-select');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/products\//);
  }

  async goTo(slug: string) {
    await this.page.goto(`/products/${slug}`);
  }

  heading(productName: string) {
    return this.page.getByRole('heading', { name: productName });
  }

  price(price: string) {
    return this.page.locator('#product-price').filter({ hasText: normalizePrice(price) });
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

  async selectSize(size: string) {
    await this.sizeSelect.selectOption(size);
  }

  async selectColor(color: string) {
    await this.colorSelect.selectOption(color);
  }

  async expectSelectedVariant(variant: string) {
    await expect(this.variantSelect).toHaveValue(/.+/);
    await expect(this.variantSelect.locator('option:checked')).toHaveText(variant);
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

function normalizePrice(price: string) {
  return price.replace('\u00c2£', '£');
}
