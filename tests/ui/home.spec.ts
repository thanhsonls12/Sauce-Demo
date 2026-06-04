import { test } from '@/fixtures/page.fixture';
import { featuredProducts } from '@/test-data/products';

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
});
