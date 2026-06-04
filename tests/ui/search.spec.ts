import { expect, test } from '@/fixtures/page.fixture';
import { products } from '@/test-data/products';

test.describe('Trang tìm kiếm @real', () => {
  test('SEARCH-001: trang tìm kiếm mở được', async ({ searchPage }) => {
    await searchPage.goTo();

    await searchPage.expectLoaded();
  });

  test('SEARCH-002: link về trang chủ hiển thị khi chưa có kết quả tìm kiếm', async ({ searchPage }) => {
    await searchPage.goTo();

    await searchPage.expectLoaded();
    await searchPage.expectEmptySearchState();
    await searchPage.expectHomepageLinkVisible();
  });

  test('SEARCH-003: tìm kiếm jacket trả về sản phẩm phù hợp', async ({ searchPage }) => {
    await searchPage.goTo();
    await searchPage.expectLoaded();

    await searchPage.search('jacket');

    await searchPage.expectLoaded();
    await searchPage.expectShowingResultsFor('jacket');
    await searchPage.expectResultVisible(/Grey jacket/i);
    await searchPage.expectResultVisible(/Noir jacket/i);
  });

  test('SEARCH-004: từ khóa không tồn tại hiển thị trạng thái không có kết quả', async ({ searchPage }) => {
    await searchPage.goTo();
    await searchPage.expectLoaded();

    await searchPage.search('zzzznotfound');

    await searchPage.expectLoaded();
    await searchPage.expectNoResultsFor('zzzznotfound');
  });

  test('SEARCH-005: tìm kiếm từ header cập nhật query trên URL', async ({ homePage, page }) => {
    await homePage.goTo();
    await homePage.expectLoaded();

    await homePage.searchFromHeader('jacket');

    await expect(page).toHaveURL(/\/search\?type=product&q=jacket/);
  });

  test('SEARCH-006: tìm kiếm không phân biệt chữ hoa chữ thường', async ({ searchPage }) => {
    await searchPage.goTo();
    await searchPage.expectLoaded();

    await searchPage.search('JACKET');

    await searchPage.expectLoaded();
    await searchPage.expectShowingResultsFor('JACKET');
    await searchPage.expectResultVisible(/Grey jacket/i);
    await searchPage.expectResultVisible(/Noir jacket/i);
  });

  test('SEARCH-007: tìm kiếm sandals trả về sản phẩm sandals', async ({ searchPage }) => {
    await searchPage.goTo();
    await searchPage.expectLoaded();

    await searchPage.search('sandals');

    await searchPage.expectLoaded();
    await searchPage.expectShowingResultsFor('sandals');
    await searchPage.expectResultVisible(/Bronze sandals/i);
    await searchPage.expectResultVisible(/White sandals/i);
  });

  test('SEARCH-VAL-001: empty search query hiển thị validation message', async ({ searchPage }) => {
    await searchPage.goTo();
    await searchPage.expectLoaded();

    await searchPage.searchButton.click();

    await searchPage.expectLoaded();
    await searchPage.expectEmptySearchState();
  });

  test('SEARCH-VAL-002: tìm kiếm ký tự đặc biệt không trả về toàn bộ products', async ({
    searchPage,
  }) => {
    await searchPage.goTo();
    await searchPage.expectLoaded();

    await searchPage.search('*');
    await searchPage.expectLoaded();

    const visibleProducts = await searchPage.visibleResultCount(products.map((product) => product.name));

    expect(visibleProducts).toBeLessThan(products.length);
  });

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
