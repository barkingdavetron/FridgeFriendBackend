// unit tests for runOCR logic function
// mocks tesseract and checks for correct text extraction

const { runOCR } = require('../logic/runOCR');
const Tesseract = require('tesseract.js');

jest.mock('tesseract.js', () => ({
  recognize: jest.fn()
}));

describe('runOCR', () => {
  it('should return extracted text from image', async () => {
    Tesseract.recognize.mockResolvedValue({ data: { text: "Expiry: 15/05/2025" } });
    const result = await runOCR("mock-path.jpg");
    expect(result).toBe("Expiry: 15/05/2025");
  });
});
