// logic to extract expiry date patterns from a block of text
// used in unit tests to validate regex detection and fallbacks
function extractExpiryDate(text) {
    const regex = /(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}|\d{2}[-/]\d{2}[-/]\d{2}|\b\d{1,2}[-/]\d{1,2}\b)/;
    const match = text.match(regex);
    return match ? match[0] : "No expiry date found";
  }
  
  module.exports = { extractExpiryDate };
  