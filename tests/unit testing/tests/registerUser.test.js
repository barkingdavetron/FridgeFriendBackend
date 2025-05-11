// unit tests for registerUser logic function
// covers duplicate detection, hashing errors, and success cases

const { registerUser } = require('../logic/registerUser');

describe('registerUser', () => {
  it('should reject if email is already registered', async () => {
    const mockDb = {
      get: jest.fn((q, p, cb) => cb(null, { id: 1 })) // simulates existing user
    };
    await expect(registerUser(mockDb, "John", "john@example.com", "pass"))
      .rejects.toEqual({ code: 400, message: "Email already registered" });
  });

  it('should reject if hashing fails', async () => {
    const mockDb = {
      get: jest.fn((q, p, cb) => cb(null, null)),
      run: jest.fn()
    };
    const bcrypt = require('bcrypt');
    jest.spyOn(bcrypt, 'hash').mockImplementation((pw, rounds, cb) => cb(new Error("fail")));

    await expect(registerUser(mockDb, "John", "john@example.com", "pass"))
      .rejects.toEqual({ code: 500, message: "Hashing error" });

    bcrypt.hash.mockRestore();
  });

  it('should resolve with userId on success', async () => {
    const mockDb = {
      get: jest.fn((q, p, cb) => cb(null, null)),
      run: jest.fn((q, p, cb) => cb.call({ lastID: 5 }, null))
    };
    const bcrypt = require('bcrypt');
    jest.spyOn(bcrypt, 'hash').mockImplementation((pw, rounds, cb) => cb(null, "hashedpass"));

    const result = await registerUser(mockDb, "Alice", "alice@example.com", "secure");
    expect(result).toEqual({ userId: 5 });

    bcrypt.hash.mockRestore();
  });
});
