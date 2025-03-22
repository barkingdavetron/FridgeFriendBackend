const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const port = 5000;
const saltRounds = 10;

app.use(express.json());
app.use(cors());

// Connect to SQLite3 database
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("error connecting to database:", err.message);
  } else {
    console.log("connected to sqlite database.");

    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )`);

    // Create ingredients table linked to users
    db.run(`CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity TEXT NOT NULL,
      expiry TEXT,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
  }
});

// Test route
app.get("/", (req, res) => {
  res.json({ message: "server is running!" });
});

// Register user with hashed password
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "please fill out all fields." });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, existingUser) => {
    if (existingUser) {
      return res.status(400).json({ error: "email already registered. use a different email." });
    }

    bcrypt.hash(password, saltRounds, (err, passwordHash) => {
      if (err) {
        return res.status(500).json({ error: "error hashing password." });
      }

      db.run(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [username, email, passwordHash],
        function (dbErr) {
          if (dbErr) {
            return res.status(500).json({ error: "registration failed." });
          }
          console.log("user added:", { id: this.lastID, username, email });
          res.json({ message: "user registered successfully", userId: this.lastID });
        }
      );
    });
  });
});

// Login user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "please fill out all fields." });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: "invalid email or password." });
    }

    bcrypt.compare(password, user.password_hash, (bcryptErr, match) => {
      if (bcryptErr || !match) {
        return res.status(401).json({ error: "invalid email or password." });
      }

      console.log("user logged in:", { id: user.id, username: user.username, email: user.email });
      res.json({ id: user.id, username: user.username, email: user.email });
    });
  });
});


// 🔥 Add Ingredient Route (Manual or Scanner)
app.post("/addIngredient", (req, res) => {
  const { name, quantity, expiry, userId } = req.body;

  if (!name || !quantity || !userId) {
    return res.status(400).json({ error: "Missing ingredient fields." });
  }

  const sql = "INSERT INTO ingredients (name, quantity, expiry, user_id) VALUES (?, ?, ?, ?)";
  db.run(sql, [name, quantity, expiry, userId], function (err) {
    if (err) {
      console.error("Failed to insert ingredient:", err);
      return res.status(500).json({ error: "Failed to add ingredient." });
    }
    res.json({ message: "Ingredient added successfully.", ingredientId: this.lastID });
  });
});

// 🔍 (Optional) Get Ingredients by User
app.get("/getIngredients/:userId", (req, res) => {
  const userId = req.params.userId;

  db.all("SELECT * FROM ingredients WHERE user_id = ?", [userId], (err, rows) => {
    if (err) {
      console.error("Error retrieving ingredients:", err);
      return res.status(500).json({ error: "Failed to fetch ingredients." });
    }
    res.json({ ingredients: rows });
  });
});

// Start server
app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
