// tests adding and fetching ingredients with jwt-based access
// covers input handling and successful retrieval
const request = require('supertest');
const { app, db } = require('../../app');

let token;

describe('Integration: Ingredients', () => {
  afterAll(() => new Promise(resolve => db.close(resolve)));
  // create test user and log in before running tests
  beforeAll(async () => {
    await request(app).post('/register').send({
      username: 'ingTestUser',
      email: 'ingtest@example.com',
      password: 'pass'
    });
    const res = await request(app).post('/login').send({
      email: 'ingtest@example.com',
      password: 'pass'
    });
    token = res.body.token;
  });
  // test posting a new ingredient
  it('should add an ingredient', async () => {
    const res = await request(app)
      .post('/ingredients')
      .set('Authorization', token)
      .send({ name: 'Tomato', quantity: '2', expiry: '2025-12-01' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ingredientId');
  });
  // test fetching user's ingredient list
  it('should get ingredients list', async () => {
    const res = await request(app)
      .get('/getIngredients')
      .set('Authorization', token);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.ingredients)).toBe(true);
  });
});
