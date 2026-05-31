import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '@/test-data/routes';
import { BasePage } from './BasePage';

export class BlogPage extends BasePage {
  readonly firstPostLink: Locator;

  constructor(page: Page) {
    super(page);

    this.firstPostLink = page.getByRole('link', { name: 'First Post' });
  }

  async goTo() {
    await this.page.goto(routes.blog);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/blogs\/news/);
    await expect(this.firstPostLink).toBeVisible();
  }
}
