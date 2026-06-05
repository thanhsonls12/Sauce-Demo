import { expect, test } from '@/fixtures/page.fixture';

test.describe('Kiểm tra khói với fixture @real', () => {
  test('SMOKE-FIXTURE-001: các page fixture chính được khởi tạo', async ({
    homePage,
    catalogPage,
    productPage,
    cartPage,
    loginPage,
    registerPage,
    searchPage,
    aboutPage,
  }) => {
    expect(homePage).toBeDefined();
    expect(catalogPage).toBeDefined();
    expect(productPage).toBeDefined();
    expect(cartPage).toBeDefined();
    expect(loginPage).toBeDefined();
    expect(registerPage).toBeDefined();
    expect(searchPage).toBeDefined();
    expect(aboutPage).toBeDefined();
  });
});
