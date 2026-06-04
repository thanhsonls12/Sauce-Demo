import type { Page } from '@playwright/test';
import { expect, test } from '@/fixtures/page.fixture';
import { products, productVariants } from '@/test-data/products';
import { routes } from '@/test-data/routes';

const greyJacket = products.find((p) => p.name === 'Grey jacket')!;
const { variantId: greyJacketVariantId } = productVariants.greyJacket;
const soldOutVariantId = '1063105029';
const requestDelayMs = 1500;

async function cartFetch(page: Page, url: string, form?: Record<string, string>) {
  await page.waitForTimeout(requestDelayMs);

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
  test.setTimeout(120_000);

  test.beforeEach(async ({ page }) => {
    await page.goto(routes.cartClear);
    await page.waitForTimeout(requestDelayMs);
  });

  test('CART-QTY-ADD-001: /cart/add.js chỉ chấp nhận quantity hợp lệ', async ({
    page,
  }) => {
    const addZeroResponse = await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: '0',
    });

    expect(addZeroResponse.status).toBe(200);

    const addPositiveResponse = await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: '2',
    });

    expect(addPositiveResponse.status).toBe(200);
    expect(addPositiveResponse.body.quantity).toBe(2);

    const addNegativeResponse = await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: '-5',
    });

    expect([400, 422]).toContain(addNegativeResponse.status);

    const addNonNumericResponse = await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: 'abc',
    });

    expect([400, 422]).toContain(addNonNumericResponse.status);
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

    const changeNonNumericResponse = await cartFetch(page, '/cart/change.js', {
      line: '1',
      quantity: 'abc',
    });

    expect([400, 422]).toContain(changeNonNumericResponse.status);

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

    expect([400, 422]).toContain(addResponse.status);
  });
});
