// logic to construct a shopping item object with default id
// unit tested for field validation and correct return format
function addShoppingItem(userId, name, quantity) {
    return new Promise((resolve, reject) => {
      if (!name || !quantity) return reject(new Error("Missing fields"));
  
      const item = { id: 1, userId, name, quantity };
      resolve(item);
    });
  }
  
  module.exports = { addShoppingItem };
  