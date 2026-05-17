import { test } from '@/fixtures/page.fixture';
import { products } from '@/test-data/products';

test.describe('Product detail page', () => {
  products.forEach((product) => {
    test(`PROD-003: ${product.name} detail hiển thị đúng tên và giá`, async ({ productPage }) => {
      await productPage.goTo(product.slug);

      await productPage.expectProductUrl(new RegExp(product.slug));
      await productPage.expectProductVisible(product.name, product.price);
    });
  });

  test('PROD-004: Brown Shades sold out không add được vào cart', async ({ productPage }) => {
    await productPage.goTo('brown-shades');

    await productPage.expectProductUrl(/brown-shades/);
    await productPage.expectProductVisible('Brown Shades', '£20.00');
    await productPage.expectSoldOutVisible();
  });
});
