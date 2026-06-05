import { expect, test } from '@/fixtures/page.fixture';
import { products } from '@/test-data/products';

test.describe('Search Security Tests @real @security', () => {
  test('SEARCH-SEC-001: tìm kiếm SQLi, XSS, HTML injection không trả về sản phẩm', async ({
    page,
    searchPage,
  }) => {
    const dialogs: string[] = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    const payloads = ["' OR '1'='1", '<script>alert("XSS")</script>', '<b>test</b>'];

    for (const payload of payloads) {
      await searchPage.goTo();
      await searchPage.expectLoaded();

      await searchPage.search(payload);
      await searchPage.expectLoaded();

      const visibleProducts = await searchPage.visibleResultCount(products.map((product) => product.name));

      expect(visibleProducts).toBe(0);
    }

    expect(dialogs).toEqual([]);
  });
});
