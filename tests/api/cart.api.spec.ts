import { expect, test } from '@/fixtures/page.fixture';
import { routes } from '@/test-data/routes';

test.describe('API giỏ hàng @real', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.cartClear);
  });

  test('API-CART-001: GET /cart.js trả về JSON giỏ hàng trống', async ({ page }) => {
    const response = await page.request.get('/cart.js', {
      headers: { Accept: 'application/json' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body).toHaveProperty('items');
    expect(Array.isArray(body.items)).toBe(true);

    expect(body).toHaveProperty('item_count');
    expect(typeof body.item_count).toBe('number');
    expect(body.item_count).toBe(0);
    expect(body.items).toEqual([]);

    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('total_price');
    expect(typeof body.total_price).toBe('number');
  });
});
