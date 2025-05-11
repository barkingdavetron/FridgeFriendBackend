// unit tests for addShoppingItem logic function
// validates name and quantity inputs and return structure

const { addShoppingItem } = require('../logic/addShoppingItem');

describe('addShoppingItem', () => {
  it('should reject if name is missing', async () => {
    await expect(addShoppingItem(1, '', '2')).rejects.toThrow("Missing fields");
  });

  it('should reject if quantity is missing', async () => {
    await expect(addShoppingItem(1, 'Eggs', '')).rejects.toThrow("Missing fields");
  });

  it('should resolve if all fields are provided', async () => {
    const result = await addShoppingItem(1, 'Eggs', '12');
    expect(result.name).toBe('Eggs');
    expect(result.quantity).toBe('12');
  });
});
