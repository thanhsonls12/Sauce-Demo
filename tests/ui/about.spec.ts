import { test } from '@/fixtures/page.fixture';

test.describe('Trang About Us @real', () => {
  test('ABOUT: nội dung chính trang About Us hiển thị', async ({ aboutPage }) => {
    await aboutPage.goTo();

    await aboutPage.expectLoaded();
    await aboutPage.expectMainContentVisible();
  });
});
