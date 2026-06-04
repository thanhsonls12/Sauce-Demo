import type { Page } from '@playwright/test';
import { expect, test } from '@/fixtures/page.fixture';
import { products, productVariants } from '@/test-data/products';
import { routes } from '@/test-data/routes';

const greyJacket = products.find((p) => p.name === 'Grey jacket')!;
const { variantId: greyJacketVariantId } = productVariants.greyJacket;
const soldOutVariantId = '1063105029';

async function cartFetch(page: Page, url: string, form?: Record<string, string>) {
  const response = form
    ? await page.request.post(url, { form, headers: { Accept: 'application/json' } })
    : await page.request.get(url, { headers: { Accept: 'application/json' } });
  const text = await response.text();
  const body = parseJson(text);

  return {
    status: response.status(),
    body,
  };
}

function parseJson(text: string) {
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

test.describe('API thay đổi giỏ hàng @real @mutation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.cartClear);
  });

  test.afterEach(async ({ page }) => {
    await page.goto(routes.cartClear);
  });

  test('CART-QTY-ADD-001: /cart/add.js chỉ chấp nhận quantity hợp lệ', async ({
    page,
  }) => {
    const addZeroResponse = await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: '0',
    });
    const cartAfterZero = await cartFetch(page, '/cart.js');

    expect(addZeroResponse.status).toBe(200);
    expect(cartAfterZero.status).toBe(200);
    expect(cartAfterZero.body.item_count).toBe(0);
    expect(cartAfterZero.body.items).toEqual([]);

    const addPositiveResponse = await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: '2',
    });
    const cartAfterPositive = await cartFetch(page, '/cart.js');

    expect(addPositiveResponse.status).toBe(200);
    expect(cartAfterPositive.status).toBe(200);
    expect(cartAfterPositive.body.item_count).toBe(2);
    expect(cartAfterPositive.body.items[0].quantity).toBe(2);

    const addNegativeResponse = await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: '-5',
    });
    const cartAfterNegative = await cartFetch(page, '/cart.js');

    expect([400, 422]).toContain(addNegativeResponse.status);
    expect(cartAfterNegative.status).toBe(200);
    expect(cartAfterNegative.body.item_count).toBe(2);
    expect(cartAfterNegative.body.items[0].quantity).toBe(2);

    const addNonNumericResponse = await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: 'abc',
    });
    const cartAfterNonNumeric = await cartFetch(page, '/cart.js');

    expect([400, 422]).toContain(addNonNumericResponse.status);
    expect(cartAfterNonNumeric.status).toBe(200);
    expect(cartAfterNonNumeric.body.item_count).toBe(2);
    expect(cartAfterNonNumeric.body.items[0].quantity).toBe(2);
  });

  test('CART-QTY-CHANGE-001: /cart/change.js chỉ chấp nhận quantity hợp lệ', async ({
    page,
  }) => {
    await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: '2',
    });

    const changeNegativeResponse = await cartFetch(page, '/cart/change.js', {
      line: '1',
      quantity: '-1',
    });

    expect([400, 422]).toContain(changeNegativeResponse.status);

    const cartAfterNegative = await cartFetch(page, '/cart.js');

    expect(cartAfterNegative.status).toBe(200);
    expect(cartAfterNegative.body.item_count).toBe(2);
    expect(cartAfterNegative.body.items[0].quantity).toBe(2);

    const changeNonNumericResponse = await cartFetch(page, '/cart/change.js', {
      line: '1',
      quantity: 'abc',
    });

    expect([400, 422]).toContain(changeNonNumericResponse.status);

    const cartAfterNonNumeric = await cartFetch(page, '/cart.js');

    expect(cartAfterNonNumeric.status).toBe(200);
    expect(cartAfterNonNumeric.body.item_count).toBe(2);
    expect(cartAfterNonNumeric.body.items[0].quantity).toBe(2);

    const changePositiveResponse = await cartFetch(page, '/cart/change.js', {
      line: '1',
      quantity: '5',
    });

    expect(changePositiveResponse.status).toBe(200);
    expect(changePositiveResponse.body.item_count).toBe(5);
    expect(changePositiveResponse.body.items[0].quantity).toBe(5);

    const changeZeroResponse = await cartFetch(page, '/cart/change.js', {
      line: '1',
      quantity: '0',
    });

    expect(changeZeroResponse.status).toBe(200);
    expect(changeZeroResponse.body.item_count).toBe(0);
    expect(changeZeroResponse.body.items).toEqual([]);
  });

  test('CART-ERR-001: POST /cart/add.js với invalid product ID trả về lỗi', async ({ page }) => {
    const addResponse = await cartFetch(page, '/cart/add.js', {
      id: '99999999999999',
      quantity: '1',
    });

    expect([404, 422]).toContain(addResponse.status);
    expect(addResponse.body).toHaveProperty('message');
  });

  test('CART-ERR-002: POST /cart/add.js với sold-out product phải bị chặn', async ({ page }) => {
    const addResponse = await cartFetch(page, '/cart/add.js', {
      id: soldOutVariantId,
      quantity: '1',
    });
    const cartResponse = await cartFetch(page, '/cart.js');

    expect([400, 422]).toContain(addResponse.status);
    expect(cartResponse.status).toBe(200);
    expect(cartResponse.body.item_count).toBe(0);
    expect(cartResponse.body.items).toEqual([]);
  });
});
