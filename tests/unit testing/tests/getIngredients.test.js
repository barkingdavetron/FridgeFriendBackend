// unit tests for getIngredients logic function
// confirms ingredient data is returned for valid users

const { getIngredients } = require('../logic/getIngredients');

describe('getIngredients', () => {
  it('should reject if userId is missing', async () => {
    await expect(getIngredients(null)).rejects.toThrow("User ID required");
  });

  it('should return array of ingredients if userId is provided', async () => {
    const result = await getIngredients(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('name');
  });
});
