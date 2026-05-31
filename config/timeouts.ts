export const timeouts = {
  realTest: 90_000,
  test: 30_000,
  navigation: 30_000,
  cloudflare: 25_000,
  serverStart: 30_000,
  load: 15_000,
  networkIdle: 10_000,
  element: 5_000,
  quick: 1_000,
} as const;
