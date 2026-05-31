import { test } from '@/fixtures/page.fixture';
import { products } from '@/test-data/products';

test.describe('Luồng tìm kiếm thật @real @e2e', () => {
  test('REAL-SEARCH-001: tìm kiếm từ header và mở chi tiết Grey jacket', async ({
    homePage,
    searchPage,
    productPage,
  }) => {
    const greyJacket = products.find((p) => p.name === 'Grey jacket')!;

    await homePage.goTo();
    await homePage.expectLoaded();

    await homePage.searchFromHeader('jacket');

    await searchPage.expectLoaded();
    await searchPage.expectShowingResultsFor('jacket');
    await searchPage.expectResultVisible(new RegExp(greyJacket.name, 'i'));

    await searchPage.openResult(new RegExp(greyJacket.name, 'i'));

    await productPage.expectProductUrl(new RegExp(`products/${greyJacket.slug}`));
    await productPage.expectProductVisible(greyJacket.name, greyJacket.price);
  });
});
