import { expect, type Locator, type Page } from '@playwright/test';
import { routes } from '@/test-data/routes';

export class SearchPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly noSearchPerformedText: Locator;
  readonly homepageLink: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading = page.getByRole('heading', { name: 'Search Results' });
    this.noSearchPerformedText = page.getByText(/No search performed/i);
    this.homepageLink = page.getByRole('link', { name: /homepage/i });
    this.searchBox = page.getByRole('banner').getByRole('textbox', { name: 'Search' });
    this.searchButton = page.getByRole('banner').getByRole('button', { name: 'Submit' });
  }

  async goTo() {
    await this.page.goto(routes.search);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/search/);
    await expect(this.heading).toBeVisible();
  }

  async expectEmptySearchState() {
    await expect(this.noSearchPerformedText).toBeVisible();
  }

  async expectHomepageLinkVisible() {
    await expect(this.homepageLink).toBeVisible();
  }

  async search(query: string) {
    await this.page.goto(`/search?q=${encodeURIComponent(query)}`);
  }

  async expectShowingResultsFor(query: string) {
    await expect(this.page.getByText(`Showing results for ${query}`)).toBeVisible();
  }

  async expectResultVisible(productName: string | RegExp) {
    await expect(this.page.getByRole('link', { name: productName })).toBeVisible();
  }

  async expectNoResultsFor(query: string) {
    await expect(this.page.getByText(`No results found for ${query}`)).toBeVisible();
  }
}
