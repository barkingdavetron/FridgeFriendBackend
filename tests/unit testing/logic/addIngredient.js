// logic to create an ingredient entry with optional expiry
// tested to confirm handling of missing fields and object output
function addIngredient(userId, name, quantity, expiry) {
    return new Promise((resolve, reject) => {
      if (!name || !quantity) {
        return reject(new Error("Missing fields"));
      }
  
      const result = { userId, name, quantity, expiry };
      resolve(result);
    });
  }
  
  module.exports = { addIngredient };
  