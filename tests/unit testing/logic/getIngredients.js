// logic to return a fixed list of ingredients for a user
// tested to ensure it handles valid and missing user ids
function getIngredients(userId) {
    return new Promise((resolve, reject) => {
      if (!userId) return reject(new Error("User ID required"));
  
      const ingredients = [
        { name: "Milk", quantity: "1L", expiry: "2025-06-01" },
        { name: "Eggs", quantity: "12", expiry: "2025-06-02" }
      ];
  
      resolve(ingredients);
    });
  }
  
  module.exports = { getIngredients };
  