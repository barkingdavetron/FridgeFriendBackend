// unit tests for deleteShoppingItem logic function
// tests behavior with missing params and successful deletion message

const { deleteShoppingItem } = require('../logic/deleteShoppingItem');

describe('deleteShoppingItem', () => {
  it('should reject if userId or itemId is missing', async () => {
    await expect(deleteShoppingItem(null, 2)).rejects.toThrow("Missing userId or itemId");
    await expect(deleteShoppingItem(1, null)).rejects.toThrow("Missing userId or itemId");
  });

  it('should resolve with success message if valid', async () => {
    const result = await deleteShoppingItem(1, 2);
    expect(result.message).toBe("Item deleted");
  });
});
