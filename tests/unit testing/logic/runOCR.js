// logic to run tesseract.js ocr on an image path
// tested with mock images to confirm text extraction
const Tesseract = require("tesseract.js");

function runOCR(imagePath) {
  return Tesseract.recognize(imagePath, "eng").then(({ data }) => data.text);
}

module.exports = { runOCR };
