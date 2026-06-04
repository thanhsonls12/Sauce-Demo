import { test } from '@/fixtures/page.fixture';
import { products, productVariants } from '@/test-data/products';

test.describe('Trang chi tiết sản phẩm @real', () => {
  products.forEach((product) => {
    test(`PROD-001: trang chi tiết ${product.name} hiển thị đúng tên và giá`, async ({
      productPage,
    }) => {
      await productPage.goTo(product.slug);

      await productPage.expectProductUrl(new RegExp(product.slug));
      await productPage.expectProductVisible(product.name, product.price);
    });
  });

  test('PROD-002: Brown Shades hết hàng nên không thêm được vào giỏ hàng', async ({
    productPage,
  }) => {
    const brownShades = products.find((p) => p.name === 'Brown Shades')!;

    await productPage.goTo(brownShades.slug);

    await productPage.expectProductUrl(new RegExp(brownShades.slug));
    await productPage.expectProductVisible(brownShades.name, brownShades.price);
    await productPage.expectSoldOutVisible();
  });

  test('PROD-003: người dùng chọn được size và màu sản phẩm', async ({ productPage }) => {
    const noirJacket = products.find((p) => p.name === 'Noir jacket')!;
    const { size, color, displayText } = productVariants.noirJacket;

    await productPage.goTo(noirJacket.slug);

    await productPage.expectProductUrl(new RegExp(noirJacket.slug));
    await productPage.expectProductVisible(noirJacket.name, noirJacket.price);
    await productPage.selectSize(size);
    await productPage.selectColor(color);

    await productPage.expectSelectedVariant(displayText);
    await productPage.expectAddToCartVisible();
  });
});
