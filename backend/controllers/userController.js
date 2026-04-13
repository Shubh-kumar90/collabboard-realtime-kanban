const db = require("../config/db");

exports.getUsers = (req, res) => {
  db.query("SELECT id, name, email FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });

    res.json(results);
  });
};