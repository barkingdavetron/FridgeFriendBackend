// unit tests for addCalories logic function
// checks for validation of input and correct object structure

const { addIngredient } = require('../logic/addIngredient');

describe('addIngredient', () => {
  it('should reject if name is missing', async () => {
    await expect(addIngredient(1, '', '1', '2025-05-01')).rejects.toThrow("Missing fields");
  });

  it('should reject if quantity is missing', async () => {
    await expect(addIngredient(1, 'Tomato', '', '2025-05-01')).rejects.toThrow("Missing fields");
  });

  it('should resolve if all fields are provided', async () => {
    const result = await addIngredient(1, 'Tomato', '2', '2025-05-01');
    expect(result.name).toBe('Tomato');
    expect(result.quantity).toBe('2');
  });
});
