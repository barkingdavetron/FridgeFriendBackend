// logic to register a user using sqlite and bcrypt hashing
// unit tested for duplicate email handling and hashing success
const bcrypt = require("bcrypt");
const saltRounds = 10;

function registerUser(db, username, email, password) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, existingUser) => {
      if (existingUser) return reject({ code: 400, message: "Email already registered" });

      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return reject({ code: 500, message: "Hashing error" });

        db.run(
          "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
          [username, email, hash],
          function (err) {
            if (err) return reject({ code: 500, message: "Insert failed" });
            resolve({ userId: this.lastID });
          }
        );
      });
    });
  });
}

module.exports = { registerUser };
