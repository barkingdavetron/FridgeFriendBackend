// logic to return a mock leaderboard list with usernames and points
// used in unit tests to verify return format and sorting
function getLeaderboard() {
  return new Promise((resolve) => {
    const mockLeaderboard = [
      { username: "Alice", points: 90 },
      { username: "Bob", points: 75 },
      { username: "Charlie", points: 60 }
    ];
    resolve(mockLeaderboard);
  });
}

module.exports = { getLeaderboard };
