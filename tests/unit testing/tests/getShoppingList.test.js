const { getShoppingList } = require('../logic/getShoppingList');

describe('getShoppingList', () => {
  it('should reject if userId is missing', async () => {
    await expect(getShoppingList(null)).rejects.toThrow("User ID required");
  });

  it('should return shopping list items', async () => {
    const result = await getShoppingList(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('quantity');
  });
});
