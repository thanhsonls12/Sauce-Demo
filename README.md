# Sauce Demo Test Automation

Test automation cho storefront Shopify:

```
https://sauce-demo.myshopify.com
```

## Công nghệ

- **Playwright** + TypeScript — UI, API, smoke tests
- **Camoufox** (Python) — real E2E flows vượt Cloudflare/hCaptcha
- **Page Object Model** — tất cả page locators tách biệt trong `pages/`
- **Fixtures** — dependency injection, auth state, Camoufox integration

## Cấu trúc project

```
├── config/              # Browser, env, timeouts, storage paths
├── fixtures/            # Playwright fixtures + Camoufox bridge
├── pages/               # Page Object Models (13 pages)
├── scripts/             # Camoufox runner, auth save, check scripts
├── test-data/           # Routes, products, variants
├── tests/
│   ├── ui/              # UI tests — giao diện, navigation, form, search
│   ├── api/             # API tests — endpoint Shopify trực tiếp
│   ├── real/            # Real E2E flows — cart, login, register, checkout, search
│   ├── security/        # Security tests — XSS, SQLi, session isolation
│   ├── smoke/           # Smoke tests — fixture sanity check
│   └── support/         # Account records, API evidence helpers
├── global-setup.ts      # Setup global trước khi chạy test
├── playwright.config.ts # Cấu hình Playwright
└── tsconfig.json        # TypeScript paths (@/pages, @/fixtures, ...)
```

## Cài đặt

**Node.js + dependencies:**

```bash
npm install
npx playwright install
```

**Camoufox (chỉ cần cho real tests):**

```bash
pip install camoufox
python -m camoufox fetch
```

## Script chính

| Script | Mục đích |
|--------|----------|
| `npm test` | Chạy API tests (bỏ `@real` và `@mutation`) |
| `npm run test:ui` | Chạy UI tests |
| `npm run test:api` | Chạy API tests (bỏ `@real` và `@mutation`) |
| `npm run test:api:real` | Chạy API tests có tag `@real` bằng Chromium |
| `npm run test:api:mutation` | Chạy API mutation tests |
| `npm run test:real` | Chạy real E2E flows bằng Camoufox |
| `npm run test:real:list` | Liệt kê real tests có sẵn |
| `npm run test:smoke` | Chạy smoke tests |
| `npm run auth:save:camoufox` | Lưu/refresh session Cloudflare bằng Camoufox |
| `npm run camoufox:check` | Kiểm tra Camoufox hoạt động |
| `npm run typecheck` | Kiểm tra TypeScript |
| `npm run lint` | ESLint |
| `npm run check` | Typecheck + lint + test |
| `npm run report` | Mở Playwright HTML report |
| `npm run codegen` | Playwright codegen cho site |
| `npm run format` | Prettier format toàn bộ project |

## Chạy riêng từng test

**UI test riêng lẻ:**

```bash
npx playwright test tests/ui/search.spec.ts --project=chromium
```

**API test riêng lẻ:**

```bash
npx playwright test tests/api/cart.api.spec.ts --project=chromium
```

**Real test riêng lẻ:**

```bash
npm run test:real -- tests/real/login-real.spec.ts
```

**Chạy test theo title:**

```bash
# UI/API
npx playwright test tests/ui/search.spec.ts --grep "SEARCH-006" --project=chromium

# Real
npm run test:real -- tests/real/search-flow-real.spec.ts --grep "REAL-SEARCH-001"
```

## Phân loại test

### UI Tests (`tests/ui/`)

Kiểm tra giao diện, navigation, form tương tác, validation.

| File | Test | Mục đích |
|------|------|----------|
| `home.spec.ts` | HOME-001 ~ HOME-003 | Trang chủ, slogan, navigation, sản phẩm nổi bật |
| `login.spec.ts` | LOGIN-001 ~ LOGIN-005, AUTH-VAL-001 ~ AUTH-VAL-004 | Form login, nhập/xóa, validation |
| `register.spec.ts` | REGISTER-001 ~ REGISTER-003, AUTH-VAL-004/006/007 | Form register, validation |
| `navigation.spec.ts` | NAV-001 ~ NAV-008 | Điều hướng từ trang chủ đến các page |
| `product.spec.ts` | PROD-001 ~ PROD-003 | Chi tiết sản phẩm, sold-out, chọn variant |
| `catalog.spec.ts` | CAT-001 ~ CAT-003 | Danh sách sản phẩm, sold-out, mở chi tiết |
| `search.spec.ts` | SEARCH-001 ~ SEARCH-006, SEARCH-VAL-001 ~ SEARCH-VAL-002 | Tìm kiếm, không phân biệt hoa/thường, empty query, ký tự đặc biệt |
| `about.spec.ts` | ABOUT-001 | Trang About Us |

### API Tests (`tests/api/`)

Gọi HTTP endpoint Shopify trực tiếp, kiểm tra status, schema, business rule.

| File | Test | Mục đích |
|------|------|----------|
| `cart.api.spec.ts` | API-CART-001 | GET `/cart.js` — giỏ hàng trống, schema đúng |
| `product.api.spec.ts` | API-PROD-001 ~ API-PROD-404 | GET `/products/*.js` — sản phẩm có sẵn, hết hàng, 404, malicious slug |
| `cart-mutation.api.spec.ts` | CART-QTY-ADD-001, CART-QTY-CHANGE-001, CART-ERR-001 ~ CART-ERR-002 | POST `/cart/add.js`, `/cart/change.js` — quantity validation, invalid ID, sold-out |

### Real E2E Tests (`tests/real/`)

Luồng đầy cuối thay đổi state thật trên storefront.

| File | Test | Mục đích |
|------|------|----------|
| `cart-real.spec.ts` | REAL-CART-001 ~ REAL-CART-002 | Giỏ hàng rỗng, thêm/cập nhật/xóa sản phẩm thật |
| `search-flow-real.spec.ts` | REAL-SEARCH-001 | Tìm từ header → mở chi tiết sản phẩm |
| `register-flow-real.spec.ts` | REAL-REGISTER-001 | Register từ navbar, ghi lại tài khoản |
| `login-real.spec.ts` | REAL-LOGIN-001 ~ REAL-LOGIN-002 | Login/logout bằng tài khoản thật |
| `checkout-flow-real.spec.ts` | REAL-CHECKOUT-001, CHECKOUT-VAL-001 | Checkout đầy đủ, giỏ hàng rỗng không checkout được |

### Security Tests (`tests/security/`)

Kiểm tra chống injection, cách ly session, XSS escaping.

| File | Test | Mục đích |
|------|------|----------|
| `cart-session-security.spec.ts` | CART-SEC-001 | Account B không kế thừa cart/checkout info của account A |
| `checkout-security.spec.ts` | CHECKOUT-SEC-001 | XSS payload trong shipping address được escaped |
| `auth-security.spec.ts` | AUTH-SEC-001 ~ AUTH-SEC-004 | Login/register reject SQLi/XSS/HTML injection |
| `search-security.spec.ts` | SEARCH-SEC-001 | Tìm kiếm SQLi/XSS/HTML không trả về sản phẩm |

### Smoke Tests (`tests/smoke/`)

| File | Test | Mục đích |
|------|------|----------|
| `smoke-fixture.spec.ts` | SMOKE-FIXTURE-001 | Kiểm tra 8 page fixture chính được khởi tạo |

## Quy ước tag

| Tag | Ý nghĩa | Chạy bằng |
|-----|---------|-----------|
| `@real` | Chạm storefront thật | Camoufox (real) / Chromium (api) |
| `@mutation` | Thay đổi state (cart, register) | Camoufox |
| `@e2e` | Flow nhiều bước theo hành vi người dùng | Camoufox |
| `@security` | Test bảo mật | Camoufox |

## Camoufox và xác thực

Real tests yêu cầu session Cloudflare hợp lệ tại:

```
playwright/.auth/shopify.json
```

Nếu báo thiếu `cf_clearance`, chạy:

```bash
npm run auth:save:camoufox
```

Giải Cloudflare/hCaptcha trong trình duyệt Camoufox, đóng tab để lưu session. Sau đó chạy real test lại.

**Real runner:** `scripts/run-ts-camoufox-real.js`

Tự động set:

- `PLAYWRIGHT_CAMOUFOX=1`
- `PLAYWRIGHT_SKIP_AUTH_SETUP=1`
- `CAMOUFOX_HEADLESS=0` (real tests chạy headful)
- Video/screenshot bật mặc định (có thể override qua env)

## Login và register thật

**Login** ưu tiên đọc tài khoản từ `.env`:

```env
SHOPIFY_TEST_EMAIL=customer@example.com
SHOPIFY_TEST_PASSWORD=password
```

Nếu không có `.env`, login đọc tài khoản mới nhất từ:

```
test-results/registered-accounts.jsonl
```

**Register** ghi lại kết quả:

```
test-results/registered-accounts.jsonl     # Chỉ account thành công
test-results/registration-attempts.jsonl     # Mọi lần thử (gồm cả bị protected)
```

## API Evidence

API tests attach evidence JSON vào Playwright report. Evidence gồm method, URL, status, body rút gọn và expected data.

```bash
npm run test:api
npm run report
```

Mở từng API test trong report để xem attachment.

## Environment Variables

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `SHOPIFY_TEST_EMAIL` | — | Email tài khoản test |
| `SHOPIFY_TEST_PASSWORD` | — | Mật khẩu tài khoản test |
| `SHOPIFY_ACCOUNT_A_EMAIL/PASSWORD` | — | Account A cho cart session security |
| `SHOPIFY_ACCOUNT_B_EMAIL/PASSWORD` | — | Account B cho cart session security |
| `PLAYWRIGHT_CHANNEL` | `chrome` | Browser channel (`chrome` hoặc `chromium`) |
| `PLAYWRIGHT_VIEWPORT_WIDTH` | `1280` | Chiều rộng viewport |
| `PLAYWRIGHT_VIEWPORT_HEIGHT` | `650` | Chiều cao viewport |
| `PLAYWRIGHT_WINDOW_WIDTH` | `1280` | Chiều rộng cửa sổ |
| `PLAYWRIGHT_WINDOW_HEIGHT` | `720` | Chiều cao cửa sổ |
| `PLAYWRIGHT_VIDEO` | `retain-on-failure` | Chế độ ghi video |
| `PLAYWRIGHT_SCREENSHOT` | `only-on-failure` | Chế độ chụp màn hình |

## Cấu hình browser

Viewport và window mặc định được cấu hình trong `config/browser.ts`:

- Viewport: `1280x650`
- Window: `1280x720`
- User agent: spoofed để tránh detection

Override bằng environment variables (xem bảng trên).
