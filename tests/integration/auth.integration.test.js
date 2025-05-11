// tests full user flow: registration, login, and accessing a protected route
// uses supertest to send real HTTP requests to the express app
const request = require('supertest');
const { app, db } = require('../../app');

describe('Integration Test: Register and Login', () => {
  let token;

  afterAll(() => new Promise(resolve => db.close(resolve)));
  // test user registration
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: "intTestUser111",
        email: "inttest1111@example.com",
        password: "securepass"
      });

    expect(res.statusCode).toBe(200);// expect success
    expect(res.body).toHaveProperty('userId'); // confirm user id is returned
  });
  // test user login and capture jwt token
  it('should login the user and return a token', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: "inttest1@example.com",
        password: "securepass"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token; // save token for next test
  });
  // access protected ingredient route using token
  it('should access protected route with token', async () => {
    const res = await request(app)
      .get('/getIngredients')
      .set('Authorization', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ingredients');
    expect(Array.isArray(res.body.ingredients)).toBe(true);
  });
});
