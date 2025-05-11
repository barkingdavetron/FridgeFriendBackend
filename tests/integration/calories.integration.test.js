// tests calorie logging and retrieval flow after login
// registers a test user and reuses jwt token for both endpoints
const request = require('supertest');
const { app, db } = require('../../app');

let token;

describe('Integration: Calories', () => {
  afterAll(() => new Promise(resolve => db.close(resolve)));
  // register and login before running calorie tests
  beforeAll(async () => {
    await request(app).post('/register').send({
      username: 'calUser',
      email: 'cal@example.com',
      password: 'calpass'
    });
    const res = await request(app).post('/login').send({
      email: 'cal@example.com',
      password: 'calpass'
    });
    token = res.body.token;
  });
  // test adding a calorie entry
  it('should log a calorie entry', async () => {
    const res = await request(app)
      .post('/calories')
      .set('Authorization', token)
      .send({ food: 'Banana', calories: 100 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('entryId');
  });
  // test retrieving all calorie entries
  it('should get calorie entries', async () => {
    const res = await request(app)
      .get('/calories')
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.entries)).toBe(true);
  });
});
