import { test } from '@/fixtures/page.fixture';

test.describe('Product browsing flow', () => {
  test('người dùng từ Home vào Catalog rồi mở Grey jacket', async ({
    homePage,
    catalogPage,
    productPage,
  }) => {
    await homePage.goTo();
    await homePage.expectLoaded();

    await homePage.goToCatalog();

    await catalogPage.expectLoaded();
    await catalogPage.openProduct(/Grey jacket/i);

    await productPage.expectProductUrl(/grey-jacket/);
    await productPage.expectProductVisible('Grey jacket', '£55.00');
  });

});
