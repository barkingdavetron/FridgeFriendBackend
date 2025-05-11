// unit tests for addCalories logic function
// checks for validation of input and correct object structure

const { addCalories } = require('../logic/addCalories');

describe('addCalories', () => {
  it('should reject if food is missing', async () => {
    await expect(addCalories(1, '', 300)).rejects.toThrow("Food and calories are required");
  });

  it('should reject if calories are missing', async () => {
    await expect(addCalories(1, 'Burger', null)).rejects.toThrow("Food and calories are required");
  });

  it('should resolve if food and calories are provided', async () => {
    const result = await addCalories(1, 'Burger', 300);
    expect(result.food).toBe('Burger');
    expect(result.calories).toBe(300);
  });
});
