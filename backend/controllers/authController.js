const db = require("../config/db");

// SIGNUP
exports.signup = (req, res) => {
  const { name, email, password, role } = req.body;

  const checkSql = "SELECT * FROM users WHERE email = ?";

  db.query(checkSql, [email], (err, results) => {

    // ✅ HANDLE ERROR FIRST
    if (err) {
      console.log("CHECK ERROR:", err);
      return res.status(500).json({ error: "DB error in check query" });
    }

    // ✅ NOW SAFE TO USE results
    if (results.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const insertSql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

    db.query(insertSql, [name, email, password, role || "member"], (err, result) => {

      if (err) {
        console.log("INSERT ERROR:", err);
        return res.status(500).json({ error: "DB error in insert" });
      }

      res.json({ message: "User registered successfully" });
    });
  });
};
// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, results) => {
    if (err) {
  console.log("DB ERROR:", err);   // 👈 ADD THIS
  return res.status(500).json({ error: err.message });
}

    if (results.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Store session
    req.session.user = {
      id: user.id,
      role: user.role,
      email: user.email
    };

    res.json({ message: "Login successful", user: req.session.user });
  });
};

// LOGOUT
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
};