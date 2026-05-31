import { expect, test } from '@/fixtures/page.fixture';
import { products } from '@/test-data/products';

test.describe('Luồng thanh toán đầu cuối @real @e2e @mutation', () => {
  test('REAL-CHECKOUT-001: người dùng có thể thêm sản phẩm vào giỏ và đi đến trang thanh toán', async ({
    homePage,
    catalogPage,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    const greyJacket = products.find((product) => product.name === 'Grey jacket')!;

    await homePage.goTo();
    await homePage.expectLoaded();
    await homePage.goToCatalog();

    await catalogPage.expectLoaded();
    await catalogPage.openProduct(/Grey jacket/i);
    await productPage.expectProductVisible(greyJacket.name, greyJacket.price);
    await productPage.addToCart();

    await cartPage.goTo();
    await cartPage.expectLoaded();
    await cartPage.expectProductVisible(greyJacket.name, greyJacket.price);
    await cartPage.checkout();

    await checkoutPage.expectLoaded();

    await checkoutPage.fillShippingAddress({
      firstName: 'Thanh',
      lastName: 'Son',
      address: '123 abc',
      city: 'Ha Noi',
      zip: '100100',
      phone: '0123456789',
    });

    await expect(checkoutPage.payNowBtn).toBeVisible();
  });
});
