import { expect, test } from '@/fixtures/page.fixture';
import { products } from '@/test-data/products';
import { routes } from '@/test-data/routes';

test.describe('Kiểm tra khói với fixture @real', () => {
  test('HOME-001: trang chủ mở được', async ({ homePage }) => {
    await homePage.goTo();

    await homePage.expectLoaded();
  });

  test('CAT-001: trang catalog mở được', async ({ catalogPage }) => {
    await catalogPage.goTo();

    await catalogPage.expectLoaded();
  });

  test('PROD-001: trang chi tiết Grey jacket mở được', async ({ productPage }) => {
    const greyJacket = products.find((p) => p.name === 'Grey jacket')!;

    await productPage.goTo(greyJacket.slug);

    await productPage.expectProductUrl(new RegExp(greyJacket.slug));
    await productPage.expectProductVisible(greyJacket.name, greyJacket.price);
  });

  test('PROD-002: trang chi tiết Noir jacket mở được', async ({ productPage }) => {
    const noirJacket = products.find((p) => p.name === 'Noir jacket')!;

    await productPage.goTo(noirJacket.slug);

    await productPage.expectProductUrl(new RegExp(noirJacket.slug));
    await productPage.expectProductVisible(noirJacket.name, noirJacket.price);
  });

  test('LOGIN-001: trang login mở được', async ({ loginPage }) => {
    await loginPage.goTo();

    await loginPage.expectLoaded();
    await loginPage.expectLoginFormVisible();
  });

  test('SEARCH-001: trang tìm kiếm mở được', async ({ searchPage }) => {
    await searchPage.goTo();

    await searchPage.expectLoaded();
    await searchPage.expectEmptySearchState();
  });

  test('ABOUT-001: trang About Us mở được', async ({ aboutPage }) => {
    await aboutPage.goTo();

    await aboutPage.expectLoaded();
  });

  test('BLOG-001: trang blog mở được', async ({ page }) => {
    await page.goto(routes.blog);

    await expect(page).toHaveURL(/blogs\/news/);
    await expect(page.getByRole('heading', { name: 'First Post' })).toBeVisible();
  });
});
