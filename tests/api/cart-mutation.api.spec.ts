import { expect, test } from '@/fixtures/page.fixture';
import { cartFetch } from '@/tests/support/api/cart';
import { attachApiEvidence } from '@/tests/support/api/evidence';
import { products, productVariants } from '@/test-data/products';
import { routes } from '@/test-data/routes';

const greyJacket = products.find((p) => p.name === 'Grey jacket')!;
const { variantId: greyJacketVariantId } = productVariants.greyJacket;

test.describe('API thay đổi giỏ hàng @real @mutation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(routes.cartClear);
    await page.goto(routes.products.greyJacket);
  });

  test.afterEach(async ({ page }) => {
    await page.goto(routes.cartClear);
  });

  test('API-CART-002: POST /cart/add.js thêm Grey jacket vào giỏ hàng', async ({
    page,
  }, testInfo) => {
    const addResponse = await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: '1',
    });

    expect(addResponse.status).toBe(200);
    expect(addResponse.body.product_title).toBe(greyJacket.name);
    expect(addResponse.body.quantity).toBe(1);

    const cartResponse = await cartFetch(page, '/cart.js');

    await attachApiEvidence(testInfo, 'cart-add-grey-jacket', {
      requests: [
        {
          method: 'POST',
          url: '/cart/add.js',
          form: {
            id: greyJacketVariantId,
            quantity: '1',
          },
          response: {
            status: addResponse.status,
            body: {
              product_title: addResponse.body.product_title,
              quantity: addResponse.body.quantity,
            },
          },
        },
        {
          method: 'GET',
          url: '/cart.js',
          response: {
            status: cartResponse.status,
            body: {
              item_count: cartResponse.body.item_count,
              firstItemTitle: cartResponse.body.items?.[0]?.product_title,
            },
          },
        },
      ],
      expected: {
        addStatus: 200,
        product_title: greyJacket.name,
        quantity: 1,
        cartStatus: 200,
        item_count: 1,
      },
    });

    expect(cartResponse.status).toBe(200);
    expect(cartResponse.body.item_count).toBe(1);
    expect(cartResponse.body.items[0].product_title).toBe(greyJacket.name);
  });

  test('API-CART-003: POST /cart/change.js xóa sản phẩm khỏi giỏ hàng', async ({
    page,
  }, testInfo) => {
    await cartFetch(page, '/cart/add.js', {
      id: greyJacketVariantId,
      quantity: '1',
    });

    const removeResponse = await cartFetch(page, '/cart/change.js', {
      line: '1',
      quantity: '0',
    });

    await attachApiEvidence(testInfo, 'cart-remove-grey-jacket', {
      requests: [
        {
          method: 'POST',
          url: '/cart/add.js',
          form: {
            id: greyJacketVariantId,
            quantity: '1',
          },
        },
        {
          method: 'POST',
          url: '/cart/change.js',
          form: {
            line: '1',
            quantity: '0',
          },
          response: {
            status: removeResponse.status,
            body: {
              item_count: removeResponse.body.item_count,
              items: removeResponse.body.items,
            },
          },
        },
      ],
      expected: {
        removeStatus: 200,
        item_count: 0,
        items: [],
      },
    });

    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body.item_count).toBe(0);
    expect(removeResponse.body.items).toEqual([]);
  });
});
