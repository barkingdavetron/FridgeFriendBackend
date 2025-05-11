// unit tests for extractExpiryDate logic function
// checks multiple date formats and fallback output

const { extractExpiryDate } = require('../logic/extractExpiryDate');

describe('extractExpiryDate', () => {
  it('should extract YYYY-MM-DD format', () => {
    const result = extractExpiryDate("Expires on 2025-05-15");
    expect(result).toBe("2025-05-15");
  });

  it('should extract DD/MM/YY format', () => {
    const result = extractExpiryDate("Use by: 15/05/25");
    expect(result).toBe("15/05/25");
  });

  it('should extract short date', () => {
    const result = extractExpiryDate("Best before: 7/8");
    expect(result).toBe("7/8");
  });

  it('should return fallback if no date found', () => {
    const result = extractExpiryDate("No expiry mentioned");
    expect(result).toBe("No expiry date found");
  });
});
