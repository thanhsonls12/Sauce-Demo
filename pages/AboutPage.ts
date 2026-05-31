import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '@/test-data/routes';
import { BasePage } from './BasePage';

export class AboutPage extends BasePage {
  readonly heading: Locator;
  readonly pageContent: Locator;

  constructor(page: Page) {
    super(page);

    this.pageContent = page.locator('#page-content');
    this.heading = page.getByRole('heading', {
      name: 'About Us',
      level: 1,
    });
  }

  async goTo() {
    await this.page.goto(routes.about);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/pages\/about-us/);
    await expect(this.heading).toBeVisible();
  }

  async expectMainContentVisible() {
    await expect(this.pageContent).toBeVisible();
    await expect(this.heading).toBeVisible();
  }
}
