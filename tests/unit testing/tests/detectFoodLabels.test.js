// unit tests for detectFoodLabels logic function
// verifies food label filtering from parent tags

const { detectFoodLabels } = require('../logic/detectFoodLabels');

describe('detectFoodLabels', () => {
  it('should return only food-related labels', async () => {
    const mockLabels = [
      { Name: "Apple", Parents: [{ Name: "Food" }] },
      { Name: "Dog", Parents: [{ Name: "Animal" }] },
      { Name: "Carrot", Parents: [{ Name: "Food" }] }
    ];

    const result = await detectFoodLabels(mockLabels);
    expect(result).toEqual(["Apple", "Carrot"]);
  });

  it('should return empty array if no food labels found', async () => {
    const mockLabels = [
      { Name: "Tree", Parents: [{ Name: "Plant" }] }
    ];

    const result = await detectFoodLabels(mockLabels);
    expect(result).toEqual([]);
  });
});
