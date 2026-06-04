import { test } from '@/fixtures/page.fixture';

test.describe('Điều hướng @real', () => {
  test('NAV-001: người dùng vào được catalog từ trang chủ', async ({ homePage, catalogPage }) => {
    await homePage.goTo();

    await homePage.goToCatalog();

    await catalogPage.expectLoaded();
  });

  test('NAV-002: người dùng vào được login từ trang chủ', async ({ homePage, loginPage }) => {
    await homePage.goTo();

    await homePage.goToLogin();

    await loginPage.expectLoaded();
  });

  test('NAV-003: người dùng vào được About Us từ trang chủ', async ({ homePage, aboutPage }) => {
    await homePage.goTo();

    await homePage.goToAboutUs();

    await aboutPage.expectLoaded();
  });

  test('NAV-004: người dùng vào được tìm kiếm từ trang chủ', async ({ homePage, searchPage }) => {
    await homePage.goTo();

    await homePage.goToSearch();

    await searchPage.expectLoaded();
  });

  test('NAV-005: người dùng vào được register từ trang chủ', async ({ homePage, registerPage }) => {
    await homePage.goTo();

    await homePage.goToRegister();

    await registerPage.expectLoaded();
  });

  test('NAV-006: người dùng vào được blog từ trang chủ', async ({ homePage, blogPage }) => {
    await homePage.goTo();

    await homePage.goToBlog();

    await blogPage.expectLoaded();
  });

  test('NAV-007: người dùng vào được Wish List từ trang chủ', async ({
    homePage,
    wishListPage,
  }) => {
    await homePage.goTo();

    await homePage.goToWishList();

    await wishListPage.expectLoaded();
  });

  test('NAV-008: người dùng vào được Refer a Friend từ trang chủ', async ({
    homePage,
    referAFriendPage,
  }) => {
    await homePage.goTo();

    await homePage.goToReferAFriend();

    await referAFriendPage.expectLoaded();
  });
});
