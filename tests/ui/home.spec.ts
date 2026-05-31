import { expect, test } from '@/fixtures/page.fixture';
import { featuredProducts } from '@/test-data/products';
import { routes } from '@/test-data/routes';

test.describe('Trang chủ @real', () => {
  test('HOME-001: trang chủ mở được và hiển thị slogan', async ({ homePage }) => {
    await homePage.goTo();

    await homePage.expectLoaded();
  });

  test('HOME-002: các link điều hướng trên header hiển thị', async ({ homePage }) => {
    await homePage.goTo();

    await homePage.expectMainNavigationVisible();
  });

  test('HOME-003: sản phẩm nổi bật hiển thị trên trang chủ', async ({ homePage }) => {
    await homePage.goTo();

    for (const productName of featuredProducts) {
      await homePage.expectFeaturedProductVisible(new RegExp(productName, 'i'));
    }
  });

  test('HOME-004: link giỏ hàng hiển thị sau khi xóa giỏ hàng @mutation', async ({
    homePage,
    page,
  }) => {
    await page.goto(routes.cartClear);
    await homePage.goTo();

    await expect(homePage.cartLink).toBeVisible();
  });
});
