import { test } from '@/fixtures/page.fixture';
import { products } from '@/test-data/products';

test.describe('Luồng duyệt sản phẩm @real @e2e', () => {
  test('người dùng từ trang chủ vào catalog rồi mở Grey jacket', async ({
    homePage,
    catalogPage,
    productPage,
  }) => {
    const greyJacket = products.find((p) => p.name === 'Grey jacket')!;

    await homePage.goTo();
    await homePage.expectLoaded();

    await homePage.goToCatalog();

    await catalogPage.expectLoaded();
    await catalogPage.openProduct(new RegExp(greyJacket.name, 'i'));

    await productPage.expectProductUrl(new RegExp(greyJacket.slug));
    await productPage.expectProductVisible(greyJacket.name, greyJacket.price);
  });
});
