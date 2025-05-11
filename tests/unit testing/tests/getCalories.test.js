// unit tests for getCalories logic function
// tests user validation and correct calorie entry output

const { getCalories } = require('../logic/getCalories');

describe('getCalories', () => {
  it('should reject if userId is missing', async () => {
    await expect(getCalories(null)).rejects.toThrow("User ID required");
  });

  it('should return calorie entries for user', async () => {
    const result = await getCalories(1);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('food');
    expect(result[0]).toHaveProperty('calories');
  });
});
