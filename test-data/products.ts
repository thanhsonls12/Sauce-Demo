export const products = [
  {
    name: 'Black heels',
    price: '£45.00',
    slug: 'black-heels',
    soldOut: false,
  },
  {
    name: 'Bronze sandals',
    price: '£39.99',
    slug: 'bronze-sandals',
    soldOut: false,
  },
  {
    name: 'Brown Shades',
    price: '£20.00',
    slug: 'brown-shades',
    soldOut: true,
  },
  {
    name: 'Grey jacket',
    price: '£55.00',
    slug: 'grey-jacket',
    soldOut: false,
  },
  {
    name: 'Noir jacket',
    price: '£60.00',
    slug: 'noir-jacket',
    soldOut: false,
  },
  {
    name: 'Striped top',
    price: '£50.00',
    slug: 'striped-top',
    soldOut: false,
  },
  {
    name: 'White sandals',
    price: '£25.00',
    slug: 'white-sandals',
    soldOut: true,
  },
] as const;

export const featuredProducts = ['Grey jacket', 'Noir jacket', 'Striped top'] as const;

export const productVariants = {
  greyJacket: {
    variantId: '611945025',
  },
  noirJacket: {
    size: 'M',
    color: 'Red',
    displayText: 'M / Red - £60.00',
  },
} as const;
