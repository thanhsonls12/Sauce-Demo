import { expect, test } from '@/fixtures/page.fixture';
import { products } from '@/test-data/products';
import { routes } from '@/test-data/routes';

test.describe('Luồng giỏ hàng thật @real @e2e @mutation', () => {
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    await page.goto(routes.cartClear);
  });

  test.afterEach(async ({ page }) => {
    await page.goto(routes.cartClear);
  });

  test('REAL-CART-001: giỏ hàng rỗng thật hiển thị đúng và tiếp tục mua sắm quay về catalog', async ({
    homePage,
    cartPage,
    catalogPage,
    page,
  }) => {
    await homePage.goTo();
    await expect(page.getByRole('link', { name: /My Cart\s*\(0\)/i })).toBeVisible();

    await cartPage.goTo();
    await cartPage.expectLoaded();
    await cartPage.expectCartEmpty();

    await cartPage.continueShopping();
    await catalogPage.expectLoaded();
  });

  test('REAL-CART-002: thêm, cập nhật số lượng và xóa sản phẩm thật trên trang giỏ hàng', async ({
    homePage,
    catalogPage,
    productPage,
    cartPage,
    page,
  }) => {
    const greyJacket = products.find((p) => p.name === 'Grey jacket')!;

    await homePage.goTo();
    await homePage.expectLoaded();
    await homePage.goToCatalog();
    await catalogPage.expectLoaded();
    await catalogPage.openProduct(new RegExp(greyJacket.name, 'i'));
    await productPage.expectProductVisible(greyJacket.name, greyJacket.price);

    await productPage.addToCart();

    await cartPage.goTo();
    await expect(page.getByRole('heading', { name: 'My Cart' })).toBeVisible();
    await expect(page.getByRole('heading', { name: new RegExp(greyJacket.name, 'i') })).toBeVisible();

    const quantityInput = page.locator('input[name="updates[]"]:visible').first();

    await expect(quantityInput).toHaveValue('1');
    await expect(page.getByText(`Total ${greyJacket.price}`)).toBeVisible();

    await page.goto(routes.cart, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    await expect(page.getByRole('heading', { name: 'My Cart' })).toBeVisible();
    await expect(page.getByRole('heading', { name: new RegExp(greyJacket.name, 'i') })).toBeVisible();
    await expect(quantityInput).toHaveValue('1');
    await expect(page.getByText(`Total ${greyJacket.price}`)).toBeVisible();

    await quantityInput.fill('2');
    await page.locator('input[name="update"]:visible').click();

    await expect(quantityInput).toHaveValue('2');
    await expect(page.getByText('Total £110.00')).toBeVisible();

    await page.getByRole('link', { name: 'x' }).click();

    await expect(page.getByText('It appears that your cart is currently empty!')).toBeVisible();
  });
});
