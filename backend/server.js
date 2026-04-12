const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();
dotenv.config();
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const app = express();
const server = http.createServer(app);

// 🔌 Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.set("io", io);





app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// ✅ SESSION MUST COME BEFORE ROUTES
app.use(session({
  secret: "collab_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: "lax"
  }
}));

// ✅ THEN ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// DB Connection
require("./config/db");

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 CollabBoard Backend Running...");
});

// Socket Connection
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

exports.createProject = (req, res) => {
  const { name } = req.body;
  const userId = req.session.user.id;

  const sql = "INSERT INTO projects (name, created_by) VALUES (?, ?)";

  db.query(sql, [name, userId], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });

    const projectId = result.insertId;

    // 🔥 AUTO ADD CREATOR AS MEMBER
    const memberSql = "INSERT INTO project_members (project_id, user_id) VALUES (?, ?)";

    db.query(memberSql, [projectId, userId]);

    res.json({ message: "Project created", projectId });
  });
};