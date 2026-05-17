import { expect, Locator, Page } from '@playwright/test';
import { routes } from '@/test-data/routes';

export class CatalogPage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Products' });
  }

  async goTo() {
    await this.page.goto(routes.catalog);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/collections\/all/);
    await expect(this.heading).toBeVisible();
  }

  productLink(productName: string | RegExp) {
    return this.page.getByRole('link', { name: productName });
  }

  async expectProductVisible(productName: string | RegExp) {
    await expect(this.productLink(productName)).toBeVisible();
  }

  async expectProductsVisible(productNames: readonly string[]) {
    for (const productName of productNames) {
      await this.expectProductVisible(new RegExp(productName, 'i'));
    }
  }

  async openProduct(productName: string | RegExp) {
    const href = await this.productLink(productName).first().getAttribute('href');
    const canonicalHref = href?.replace(/^\/collections\/[^/]+/, '');

    await this.page.goto(canonicalHref ?? href ?? '');
  }

  async expectSoldOutVisible() {
    await expect(this.page.getByText('Sold Out', { exact: true }).first()).toBeVisible();
  }
}
