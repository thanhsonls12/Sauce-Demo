import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '@/test-data/routes';
import { BasePage } from './BasePage';
import { timeouts } from '@/config/timeouts';

export class HomePage extends BasePage {
  readonly slogan: Locator;
  readonly catalogLink: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly blogLink: Locator;
  readonly searchLink: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly aboutUsLink: Locator;
  readonly wishListLink: Locator;
  readonly referAFriendLink: Locator;
  readonly cartLink: Locator;
  readonly accountLink: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.slogan = page.getByText('Just a demo site showing off what Sauce can do.');
    this.catalogLink = page.getByRole('link', { name: 'Catalog' });
    this.loginLink = page.getByRole('banner').getByRole('link', { name: 'Log In' });
    this.registerLink = page.getByRole('link', { name: 'Sign Up' });
    this.blogLink = page.getByRole('link', { name: 'Blog' });
    this.searchLink = page.getByRole('banner').getByRole('link', { name: 'Search' });
    this.searchBox = page.getByRole('banner').getByRole('textbox', { name: 'Search' });
    this.searchButton = page.getByRole('banner').getByRole('button', { name: 'Submit' });
    this.aboutUsLink = page.getByRole('link', { name: 'About us' }).first();
    this.wishListLink = page.getByRole('link', { name: 'Wish List' }).first();
    this.referAFriendLink = page.getByRole('link', { name: 'Refer a Friend' }).first();
    this.cartLink = page.getByRole('banner').getByRole('link', { name: 'Check Out' });
    this.accountLink = page.getByRole('banner').getByRole('link', { name: 'MyAccount' });
    this.logoutLink = page.getByRole('banner').getByRole('link', { name: 'Log Out' });
  }

  async goTo() {
    await this.page.goto(routes.home);
  }

  async expectLoaded() {
    await expect(this.page).toHaveTitle(/Sauce Demo/);
    await expect(this.slogan).toBeVisible();
  }

  async expectMainNavigationVisible() {
    await expect(this.catalogLink).toBeVisible();
    await expect(this.loginLink).toBeVisible();
    await expect(this.blogLink).toBeVisible();
    await expect(this.searchLink).toBeVisible();
    await expect(this.aboutUsLink).toBeVisible();
    await expect(this.wishListLink).toBeVisible();
    await expect(this.referAFriendLink).toBeVisible();
    await expect(this.cartLink).toBeVisible();
  }

  async expectFeaturedProductVisible(productName: string | RegExp) {
    await expect(this.page.getByRole('link', { name: productName })).toBeVisible();
  }

  async goToCatalog() {
    await this.catalogLink.click();
  }

  async goToLogin() {
    await this.loginLink.click();
  }

  async loginLinkIsVisible() {
    return this.loginLink.isVisible().catch(() => false);
  }

  async accountLinkIsVisible() {
    return this.accountLink.isVisible().catch(() => false);
  }

  async logoutLinkIsVisible() {
    return this.logoutLink.isVisible().catch(() => false);
  }

  async logout() {
    if (await this.logoutLinkIsVisible()) {
      await this.logoutLink.click();
    } else {
      await this.page.goto('/account/logout', { waitUntil: 'domcontentloaded' });
    }

    await this.page.waitForLoadState('domcontentloaded', { timeout: timeouts.load }).catch(() => {});
    await this.page.reload({ waitUntil: 'domcontentloaded', timeout: timeouts.load }).catch(async () => {
      await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    });

    if (!(await this.loginLinkIsVisible())) {
      await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    }
  }

  async goToRegister() {
    await this.registerLink.click();
  }

  async goToBlog() {
    await this.blogLink.click();
  }

  async goToSearch() {
    await this.searchLink.click();
  }

  async goToAboutUs() {
    await this.aboutUsLink.click();
  }

  async goToWishList() {
    await this.wishListLink.click();
  }

  async goToReferAFriend() {
    await this.referAFriendLink.click();
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async searchFromHeader(query: string) {
    await this.searchBox.fill(query);
    await this.searchButton.click();
  }
}
