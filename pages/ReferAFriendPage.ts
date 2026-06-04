import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '@/test-data/routes';
import { BasePage } from './BasePage';

export class ReferAFriendPage extends BasePage {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = page.getByRole('heading', { name: 'Refer a Friend', level: 1 });
  }

  async goTo() {
    await this.page.goto(routes.referAFriend);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/pages\/refer-a-friend/);
    await expect(this.heading).toBeVisible();
  }
}
