// logic to simulate deletion of a shopping item
// tested for correct response and error when ids are missing
function deleteShoppingItem(userId, itemId) {
    return new Promise((resolve, reject) => {
      if (!userId || !itemId) return reject(new Error("Missing userId or itemId"));
  
      resolve({ message: "Item deleted" });
    });
  }
  
  module.exports = { deleteShoppingItem };
  