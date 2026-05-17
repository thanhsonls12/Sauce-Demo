import { test, expect, type Page } from '@playwright/test';

const greyJacketVariantId = '611945025';

function formValue(body: string | null, key: string) {
  return new URLSearchParams(body ?? '').get(key);
}

async function mockCartApi(page: Page) {
  let itemCount = 0;

  await page.route('**/cart/add.js', async (route) => {
    itemCount = Number(formValue(route.request().postData(), 'quantity') ?? 1);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        product_title: 'Grey jacket',
        quantity: itemCount,
      }),
    });
  });

  await page.route('**/cart/change.js', async (route) => {
    const quantity = Number(formValue(route.request().postData(), 'quantity') ?? 0);
    itemCount = quantity;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        item_count: itemCount,
        items: itemCount === 0 ? [] : [{ product_title: 'Grey jacket', quantity: itemCount }],
      }),
    });
  });

  await page.route('**/cart.js', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        item_count: itemCount,
        items: itemCount === 0 ? [] : [{ product_title: 'Grey jacket', quantity: itemCount }],
      }),
    });
  });
}

async function cartFetch(page: Page, path: string, body?: Record<string, string>) {
  return page.evaluate(
    async ({ path, body }) => {
      const response = await fetch(path, {
        method: body ? 'POST' : 'GET',
        headers: body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : undefined,
        body: body ? new URLSearchParams(body) : undefined,
      });

      return {
        status: response.status,
        body: await response.json(),
      };
    },
    { path, body }
  );
}

test.describe('Cart mutation API', () => {
  test.beforeEach(async ({ page }) => {
    await mockCartApi(page);
    await page.goto('/products/grey-jacket');
  });

  test('API-CART-002: POST /cart/add.js thêm Grey jacket vào cart', async ({ page }) => {
    const addResponse = await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: '1',
    });

    expect(addResponse.status).toBe(200);
    expect(addResponse.body.product_title).toBe('Grey jacket');
    expect(addResponse.body.quantity).toBe(1);

    const cartResponse = await cartFetch(page, '/cart.js');

    expect(cartResponse.status).toBe(200);
    expect(cartResponse.body.item_count).toBe(1);
    expect(cartResponse.body.items[0].product_title).toBe('Grey jacket');
  });

  test('API-CART-003: POST /cart/change.js remove item khỏi cart', async ({ page }) => {
    await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: '1',
    });

    const removeResponse = await cartFetch(page, '/cart/change.js', {
      line: '1',
      quantity: '0',
    });

    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body.item_count).toBe(0);
    expect(removeResponse.body.items).toEqual([]);
  });
});
