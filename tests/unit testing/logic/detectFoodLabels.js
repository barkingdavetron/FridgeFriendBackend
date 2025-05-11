// logic to filter aws rekognition labels for food-related items
// unit tested with mock label arrays to confirm filtering accuracy
async function detectFoodLabels(imageLabels) {
    return imageLabels
      .filter(label => label.Parents?.some(parent => parent.Name === "Food"))
      .map(label => label.Name);
  }
  
  module.exports = { detectFoodLabels };
  