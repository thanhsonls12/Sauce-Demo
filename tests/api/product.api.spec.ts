import { expect, test } from '@playwright/test';

test.describe('API sản phẩm @real', () => {
  test('API-PROD-001: GET available product trả về schema và variant available', async ({
    request,
  }) => {
    const response = await request.get('/products/grey-jacket.js', {
      headers: { Accept: 'application/json' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    const variant = body.variants[0];

    expect(body).toHaveProperty('id');
    expect(body.title).toBe('Grey jacket');
    expect(body.handle).toBe('grey-jacket');
    expect(Array.isArray(body.variants)).toBe(true);
    expect(body.variants.length).toBeGreaterThan(0);

    expect(variant).toHaveProperty('id');
    expect(variant).toHaveProperty('price');
    expect(variant.available).toBe(true);
  });

  test('API-PROD-002: GET sold-out product trả về variant unavailable', async ({ request }) => {
    const response = await request.get('/products/brown-shades.js', {
      headers: { Accept: 'application/json' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.title).toBe('Brown Shades');
    expect(body.handle).toBe('brown-shades');
    expect(Array.isArray(body.variants)).toBe(true);
    expect(body.variants.length).toBeGreaterThan(0);
    expect(body.variants.every((variant) => variant.available === false)).toBe(true);
  });

  test('API-PROD-003: GET sản phẩm không tồn tại trả về 404', async ({ request }) => {
    const response = await request.get('/products/not-exist-product.js');

    expect(response.status()).toBe(404);
  });

  test('API-PROD-004: GET product API với malicious slug bị reject và không 5xx', async ({
    request,
  }) => {
    const maliciousSlugs = [
      '../../../etc/passwd',
      "product' OR '1'='1",
      "product'; DROP TABLE products--",
    ];

    for (const slug of maliciousSlugs) {
      const response = await request.get(`/products/${encodeURIComponent(slug)}.js`);

      expect([400, 404]).toContain(response.status());
      expect(response.status()).toBeLessThan(500);
    }
  });
});
