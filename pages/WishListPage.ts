import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '@/test-data/routes';
import { BasePage } from './BasePage';

export class WishListPage extends BasePage {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = page.getByRole('heading', { name: 'Wish List', level: 1 });
  }

  async goTo() {
    await this.page.goto(routes.wishList);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/pages\/wish-list/);
    await expect(this.heading).toBeVisible();
  }
}
