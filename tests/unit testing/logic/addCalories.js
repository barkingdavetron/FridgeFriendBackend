// logic to generate a calorie entry object for a user
// used in unit tests to validate structure and input handling
function addCalories(userId, food, calories) {
    return new Promise((resolve, reject) => {
      if (!food || !calories) {
        return reject(new Error("Food and calories are required"));
      }
  
      const entry = {
        userId,
        food,
        calories,
        createdAt: new Date().toISOString()
      };
      resolve(entry);
    });
  }
  
  module.exports = { addCalories };
  