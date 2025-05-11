// unit tests for getLeaderboard logic function
// checks array structure and descending sort by points

const { getLeaderboard } = require('../logic/getLeaderboardLogic');

describe('getLeaderboard', () => {
  it('should return an array of leaderboard entries', async () => {
    const result = await getLeaderboard();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should contain username and points in each entry', async () => {
    const result = await getLeaderboard();
    result.forEach(entry => {
      expect(entry).toHaveProperty('username');
      expect(entry).toHaveProperty('points');
    });
  });

  it('should return leaderboard sorted by points descending', async () => {
    const result = await getLeaderboard();
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].points).toBeGreaterThanOrEqual(result[i].points);
    }
  });
});
