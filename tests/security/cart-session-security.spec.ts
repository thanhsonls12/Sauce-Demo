import { expect, test } from '@/fixtures/page.fixture';
import { loadDotenv } from '@/config/env';
import { products } from '@/test-data/products';
import { routes } from '@/test-data/routes';

loadDotenv();

const greyJacket = products.find((product) => product.name === 'Grey jacket')!;
const checkoutInfo = {
  firstName: 'Alice',
  lastName: 'LeakTest',
  address: '123 Leak Street',
};

function accountCredentials(prefix: 'A' | 'B') {
  const email = process.env[`SHOPIFY_ACCOUNT_${prefix}_EMAIL`];
  const password = process.env[`SHOPIFY_ACCOUNT_${prefix}_PASSWORD`];

  if (!email || !password) return null;

  return { email, password };
}

async function loginAs(loginPage, credentials: { email: string; password: string }) {
  await loginPage.goTo();
  await loginPage.expectLoaded();
  await loginPage.fillLoginForm(credentials.email, credentials.password);
  await loginPage.submitLoginForm();
  await loginPage.expectAccountLoaded();
}

async function fillIfVisible(locator, value: string) {
  if (await locator.isVisible().catch(() => false)) {
    await locator.fill(value);
  }
}

async function expectEmptyIfVisible(locator) {
  if (await locator.isVisible().catch(() => false)) {
    await expect(locator).toHaveValue('');
  }
}

test.describe('Cart session security @real @security @e2e', () => {
  test.setTimeout(120_000);

  test('CART-SEC-001: account B không được kế thừa cart và checkout info của account A', async ({
    page,
    homePage,
    loginPage,
    catalogPage,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    const accountA = accountCredentials('A');
    const accountB = accountCredentials('B');

    test.skip(
      !accountA || !accountB,
      'Set SHOPIFY_ACCOUNT_A_EMAIL/PASSWORD and SHOPIFY_ACCOUNT_B_EMAIL/PASSWORD.'
    );

    await page.goto(routes.cartClear);
    await loginAs(loginPage, accountA!);

    await homePage.goTo();
    await homePage.goToCatalog();
    await catalogPage.openProduct(/Grey jacket/i);
    await productPage.addToCart();

    await cartPage.goTo();
    await cartPage.expectLoaded();
    await cartPage.expectProductVisible(greyJacket.name, greyJacket.price);
    await cartPage.checkout();
    await checkoutPage.expectLoaded();
    await fillIfVisible(checkoutPage.firstNameInput, checkoutInfo.firstName);
    await fillIfVisible(checkoutPage.lastNameInput, checkoutInfo.lastName);
    await fillIfVisible(checkoutPage.addressInput, checkoutInfo.address);

    await homePage.goTo();
    await homePage.logout();
    await loginAs(loginPage, accountB!);

    await cartPage.goTo();
    await cartPage.expectLoaded();
    await cartPage.expectCartEmpty();
    await expect(page.getByRole('heading', { name: /Grey jacket/i })).not.toBeVisible();

    await page.goto(routes.cartClear);
    await homePage.goToCatalog();
    await catalogPage.openProduct(/Grey jacket/i);
    await productPage.addToCart();
    await cartPage.goTo();
    await cartPage.checkout();
    await checkoutPage.expectLoaded();

    await expectEmptyIfVisible(checkoutPage.firstNameInput);
    await expectEmptyIfVisible(checkoutPage.lastNameInput);
    await expectEmptyIfVisible(checkoutPage.addressInput);
  });
});
