const { formatCurrency, validateUsername, addToCart, cart } = require('./script');

describe('script utilities', () => {
  beforeEach(() => {
    cart.length = 0;
  });

  test('formatCurrency returns USD string for numeric values', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  test('validateUsername returns true for valid usernames', () => {
    expect(validateUsername('A1!bc')).toBe(true);
  });

  test('validateUsername returns false for invalid usernames', () => {
    expect(validateUsername('abc')).toBe(false);
    expect(validateUsername('abcD1')).toBe(false);
    expect(validateUsername('abcd!')).toBe(false);
  });

  test('addToCart adds a product and increments quantity on duplicate', () => {
    addToCart(1);
    addToCart(1);

    expect(cart).toHaveLength(1);
    expect(cart[0].id).toBe(1);
    expect(cart[0].quantity).toBe(2);
  });

  test('addToCart does nothing for unknown product IDs', () => {
    addToCart(9999);
    expect(cart).toHaveLength(0);
  });
});