// import the express app from app.js
const { app } = require('./app');

// set port
const port = process.env.PORT || 5000;

// start the server and listen on the  port
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
