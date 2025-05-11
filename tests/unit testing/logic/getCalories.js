// logic to return mock calorie entries for a user
// used in unit tests to check structure and user id validation
function getCalories(userId) {
    return new Promise((resolve, reject) => {
      if (!userId) return reject(new Error("User ID required"));
  
      const entries = [
        { food: "Pizza", calories: 300, createdAt: new Date().toISOString() },
        { food: "Salad", calories: 120, createdAt: new Date().toISOString() }
      ];
  
      resolve(entries);
    });
  }
  
  module.exports = { getCalories };
  