import { test, expect } from '@/fixtures/page.fixture';

async function mockCartFlow(page) {
  let itemCount = 0;

  await page.route('**/cart/add.js', async (route) => {
    itemCount = 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        product_title: 'Grey jacket',
        quantity: 1,
      }),
    });
  });

  await page.route('**/cart.js', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        item_count: itemCount,
        items:
          itemCount === 1
            ? [
                {
                  product_title: 'Grey jacket',
                  quantity: 1,
                  price: 5500,
                },
              ]
            : [],
      }),
    });
  });

  await page.route(/.*\/cart\/change.*/, async (route) => {
    itemCount = 0;
    await route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: `
        <h1>My Cart</h1>
        <p>It appears that your cart is currently empty! <a href="/collections/all">Continue Shopping</a>.</p>
      `,
    });
  });

  await page.route('**/cart', async (route) => {
    const body =
      itemCount === 1
        ? `
            <h1>My Cart</h1>
            <h3><a href="/collections/all/products/grey-jacket">Grey jacket - Grey jacket</a></h3>
            <span>£55.00</span>
            <input value="1" />
            <a href="/cart/change?line=1&quantity=0">x</a>
            <h2>Total £55.00</h2>
          `
        : `
            <h1>My Cart</h1>
            <p>It appears that your cart is currently empty! <a href="/collections/all">Continue Shopping</a>.</p>
          `;

    await route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body,
    });
  });
}

test.describe('Cart page', () => {
  test('CART-002: cart rỗng hiển thị thông báo phù hợp', async ({ cartPage }) => {
    await cartPage.goTo();

    await cartPage.expectLoaded();
    await cartPage.expectCartEmpty();
  });

  test('CART-003: Continue Shopping điều hướng về catalog', async ({ cartPage, catalogPage }) => {
    await cartPage.page.route('**/collections/all', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: '<h1>Products</h1>',
      });
    });

    await cartPage.goTo();

    await cartPage.expectLoaded();
    await cartPage.expectCartEmpty();

    await cartPage.continueShopping();

    await catalogPage.expectLoaded();
  });

  test('CART-004: header cart count ban đầu là 0', async ({ homePage, page }) => {
    await homePage.goTo();

    await expect(page.getByRole('link', { name: /My Cart\s*\(0\)/i })).toBeVisible();
  });

  test('CART-005: add Grey jacket vào cart và hiển thị đúng item', async ({
    productPage,
    cartPage,
    page,
  }) => {
    await mockCartFlow(page);

    await productPage.goTo('grey-jacket');
    await productPage.expectProductVisible('Grey jacket', '£55.00');

    await productPage.addToCart();

    await cartPage.goTo();
    await cartPage.expectLoaded();
    await cartPage.expectProductVisible('Grey jacket', '£55.00');
    await cartPage.expectQuantity('1');
  });

  test('CART-006: remove item khỏi cart rồi cart rỗng lại', async ({ productPage, cartPage, page }) => {
    await mockCartFlow(page);

    await productPage.goTo('grey-jacket');
    await productPage.addToCart();

    await cartPage.goTo();
    await cartPage.expectLoaded();
    await cartPage.expectProductVisible('Grey jacket', '£55.00');

    await cartPage.removeFirstItem();

    await cartPage.expectLoaded();
    await cartPage.expectCartEmpty();
  });
});
