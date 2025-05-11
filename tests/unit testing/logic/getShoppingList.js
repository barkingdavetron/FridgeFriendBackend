// logic to return a mock shopping list for a user
// tested for correct user validation and expected item output
function getShoppingList(userId) {
    return new Promise((resolve, reject) => {
      if (!userId) return reject(new Error("User ID required"));
  
      const items = [
        { name: "Milk", quantity: "1L" },
        { name: "Bread", quantity: "1 loaf" }
      ];
      resolve(items);
    });
  }
  
  module.exports = { getShoppingList };
  