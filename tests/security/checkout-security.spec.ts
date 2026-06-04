import { test } from '@/fixtures/page.fixture';

test.describe('Checkout Security & Error Tests @real @e2e', () => {
  test('CHECKOUT-SEC-001: checkout với XSS payloads trong shipping address được escaped', async ({
    page,
    homePage,
    catalogPage,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    await homePage.goTo();
    await homePage.goToCatalog();
    await catalogPage.openProduct(/Grey jacket/i);
    await productPage.addToCart();
    await cartPage.goTo();
    await cartPage.checkout();
    await checkoutPage.expectLoaded();

    // Setup dialog listener
    const dialogs: string[] = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    // Test XSS payloads in address fields
    const xssPayloads = ['<script>alert("XSS")</script>', '<img src=x onerror=alert("XSS")>'];

    for (const payload of xssPayloads) {
      await checkoutPage.fillShippingAddress({
        firstName: payload,
        lastName: 'User',
        address: payload,
        city: payload,
        zip: '100100',
        phone: '0123456789',
      });

      await page.waitForTimeout(1000);

      // Verify no XSS alert triggered
      if (dialogs.length > 0) {
        throw new Error(`XSS vulnerability detected: ${dialogs.join(', ')}`);
      }

      await checkoutPage.expectLoaded();
    }
  });
});
