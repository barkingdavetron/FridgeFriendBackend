require('dotenv').config(); // Load environment variables this contains all my keys for the aws, spoonacular etc
// import  dependencies
const express = require("express");//express for routing
const sqlite3 = require("sqlite3").verbose();//sqlite
const cors = require("cors");//cors for cross oroigin resource sharing
const bcrypt = require("bcrypt");//bcrypt for hashing passwords
const jwt = require("jsonwebtoken");//jwt for using and verifying tokens for session managment
const multer = require("multer");//handles files uploads
const fs = require("fs");// Node.js file system module used to delete the temportary images
const Tesseract = require("tesseract.js");//tesseract is the ocr tool to extract the text from image
const AWS = require("aws-sdk");//aws sdk so i can use rekogntion
const sharp = require("sharp");//used for shrinking image so it can be uploaded
const axios = require("axios");//axuios for hhtp requests
// create express app and load configs
const app = express();
const saltRounds = 10;
const secretKey = process.env.SECRET_KEY 
// configure aws rekognition might move later
const rekognition = new AWS.Rekognition({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "eu-west-1",
});
console.log("AWS Rekognition configured");
// using JSON body parser 
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// handles verify jwt token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  console.log("Authorization  received:", token);
  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(401);
    req.user = user;
    next();
  });
};

// // init db 
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error("Database error:", err.message);
  else {
    console.log("Connected to SQLite DB");
    //users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      score INTEGER DEFAULT 0
    )`)//ingredients table
    db.run(`CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity TEXT NOT NULL,
      expiry TEXT,
      userId INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);
    //calories table
    db.run(`CREATE TABLE IF NOT EXISTS calories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food TEXT NOT NULL,
      calories INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);
    //shjopping list tbale
    db.run(`CREATE TABLE IF NOT EXISTS shoppingList (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity TEXT NOT NULL,
      userId INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);
  }console.log("TABLES CREATED");
});

// root route
app.get("/", (req, res) => res.json({ message: "Server is running" }));
// user reg route
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  console.log("received registration data:", { username, email });
  if (!username || !email || !password)
    return res.status(400).json({ error: "please fill all fields" });

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, existingUser) => {
    if (existingUser) return res.status(400).json({ error: "email already registered" });
    console.log("email already exists:", email);
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return res.status(500).json({ error: "error hashing password" });

      db.run("INSERT INTO users (username, email, passwordHash) VALUES (?, ?, ?)", [username, email, hash], function (err) {
        if (err) return res.status(500).json({ error: "Registration failed" });
        res.json({ message: "user registered", userId: this.lastID });
      });
    });
  });
});
// user login 
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "please fill all the fields" });

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) return res.status(401).json({ error: "invalid  credentials" });

    bcrypt.compare(password, user.passwordHash, (err, match) => {
      if (!match) return res.status(401).json({ error: "invalid credentials " });

      const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, secretKey, { expiresIn: "1h"  });
      res.json({ id: user.id, email: user.email, username: user.username, token });
    });
  });
});
// add ingredient to user list
app.post("/ingredients", authenticateToken, (req, res) => {
  const { name, quantity, expiry } = req.body;
  const userId = req.user.id;
//check if fields are full
  if (!name || !quantity)
    return res.status(400).json({ error: "missing fields" });

  db.run("INSERT INTO ingredients (name, quantity, expiry, userId) VALUES (?, ?, ?, ?)", [name, quantity, expiry, userId], function (err) {
    if (err) return res.status(500).json({ error: "Failed  to add ingredient " });
    res.json({ message: "ingredient added", ingredientId: this.lastID });
  });
});
// get all user ingredents
app.get("/getIngredients", authenticateToken, (req, res) => {
  //remove
  console.log("received GET / request"); 
  const userId = req.user.id;
  db.all("SELECT * FROM ingredients WHERE userId = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "failed to fetch ingredients " });
    res.json({ ingredients: rows });
  });
});
// log calorie entry
app.post("/calories", authenticateToken, (req, res) => {
  const { food, calories } = req.body;
  const userId = req.user.id;
  //check if fields are full
  if (!food || !calories) return res.status(400).json({ error: "Food  and calories are required." });

  db.run("INSERT INTO calories (food, calories, userId) VALUES (?, ?, ?)", [food, calories, userId], function (err) {
    if (err) return res.status(500).json({ error: "failed to log calories."  });
    res.json({ message: "calories logged.", entryId: this.lastID });
  });
});
// get calorie history for a user
app.get("/calories", authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.all("SELECT * FROM calories WHERE userId = ? ORDER BY createdAt DESC", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "failed to fetch data." });
    res.json({ entries: rows });
  });
});
// image upload config
const upload = multer({ dest: "uploads/" });
// combined ocr and rekognition endpoint which does ocr and label trection
app.post("/scan-expiry", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "N image provided" });
  const filePath = req.file.path;

  try {
    // perform ocr with tesseract
    const { data } = await Tesseract.recognize(filePath, "eng");
    const ocrText = data.text;
    const dateRegex = /(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}|\d{2}[-/]\d{2}[-/]\d{2}|\b\d{1,2}[-/]\d{1,2}\b)/;
    const matchedDate = ocrText.match(dateRegex);
    const extractedDate = matchedDate ? matchedDate[0] : "No expiry   date found";
    //sharp to condense image so aws can handle it
    const buffer = await sharp(filePath).resize({ width: 800 }).toBuffer();
    const rekogParams = {
      Image: { Bytes: buffer },
      MaxLabels: 10,
      MinConfidence: 85,
    };
    //use aws under with parent label of food
    const rekogResult = await rekognition.detectLabels(rekogParams).promise();
    const foodLabels = rekogResult.Labels?.filter(label =>
      label.Parents?.some(parent => parent.Name === "Food")
    ).map(label => label.Name) || [];

    res.json({ text: ocrText, expiryDate: extractedDate, labels: foodLabels  });
  } catch (error) {
    res.status(500).json({ error: "Failed to process image"  });
  } finally {
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.warn("Failed to delete temp file:", err);
    }
  }
});
// get shopping list
app.get("/shopping-list", authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.all("SELECT * FROM shoppingList WHERE userId = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to load shopping list" });
    res.json({ items: rows });
  });
});
// add  to shopping list
app.post("/shopping-list", authenticateToken, (req, res) => {
  const { name, quantity } = req.body;
  const userId = req.user.id;
  //check if fields are full
  if (!name || !quantity) return res.status(400).json({ error: "Missing  fields" });

  db.run("INSERT INTO shoppingList (name, quantity, userId) VALUES (?, ?, ?)", [name, quantity, userId], function (err) {
    if (err) return res.status(500).json({ error: "Failed to add item" });
    res.json({ message: "Item added", itemId: this.lastID });
  });
});
// delete item from shopping list
app.delete("/shopping-list/:id", authenticateToken, (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.id;
  db.run("DELETE FROM shoppingList WHERE id = ? AND userId = ?", [itemId, userId], function (err) {
    if (err) return res.status(500).json({ error: "Failed to delete item" });
    res.json({ message: "Item deleted" });
  });
});
// remove ingredient and award 1 point
app.delete("/ingredients/:id", authenticateToken, (req, res) => {
  const ingredientId = req.params.id;
  const userId = req.user.id;

  db.run(
    "DELETE FROM ingredients WHERE id = ? AND userId = ?",
    [ingredientId, userId],
    function (err) {
      if (err) return res.status(500).json({ error: "Failed to delete ingredient" });
      if (this.changes === 0) return res.status(404).json({ error: "Ingredient not  found or unauthorized" });

      db.run("UPDATE users SET score = score + 1 WHERE id = ?", [userId], function (err) {
        if (err) return res.status(500).json({ error: "Failed to update score" });

        res.json({ message: "Ingredient deleted and score updated" });
      });
    }
  );
});

// leaderboard 
app.get("/leaderboard", (req, res) => {
  db.all("SELECT username, score AS points FROM users ORDER BY score DESC LIMIT 5", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to retrieve leaderboard" });
    res.json({ leaderboard: rows });
  });
});
// get list of ingredient names only
app.get("/ingredients-list", authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.all("SELECT name FROM ingredients WHERE userId = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch  ingredients" });
    const ingredientList = rows.map(r => r.name).join(",");
    res.json({ ingredients: ingredientList });
  });
});
// fetch recipes using spoonacular api
app.get("/recipes", async (req, res) => {
  const query = req.query.query;
  try {
    const response = await axios.get("https://api.spoonacular.com/recipes/complexSearch", {
      params: {
        query,
        number: 10,
        apiKey: process.env.SPOONACULAR_API_KEY,
      },
    });
    const recipes = response.data.results;
    res.json({ recipes });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});
// export app and db 
module.exports = { app, db };
