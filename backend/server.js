const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

// ROUTES
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

// ================= CORS CONFIG =================
// const FRONTEND_URL = "https://collabboard-realtime-kanban.vercel.app";
const FRONTEND_URL = "https://collabboard-realtime-kanban.vercel.app";

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRONTEND_URL);
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // 🔥 THIS LINE FIXES YOUR ISSUE
  }

  next();
});
app.set("io", io);

// ================= MIDDLEWARE =================
app.use(express.json());

// ✅ FIXED CORS
// app.use(cors({
//   origin: FRONTEND_URL,
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));
// app.options("*", cors());
// ================= SESSION =================
app.use(session({
  secret: "collab_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // required for HTTPS
    sameSite: "none"     // required for cross-origin
  }
}));

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

// ================= DB =================
require("./config/db");

// ================= TEST =================
app.get("/", (req, res) => {
  res.send("🚀 Backend Running");
});

// ================= SOCKET LOGIC =================
let onlineUsers = [];
let userSocketMap = {};

io.on("connection", (socket) => {
  console.log("⚡ Connected:", socket.id);

  socket.on("userOnline", (username) => {
    socket.username = username;

    if (!onlineUsers.includes(username)) {
      onlineUsers.push(username);
    }

    userSocketMap[username] = socket.id;

    io.emit("onlineUsers", onlineUsers);
  });

  socket.on("sendNotification", ({ toUser, message }) => {
    const target = userSocketMap[toUser];
    if (target) {
      io.to(target).emit("notification", {
        message,
        time: new Date()
      });
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      onlineUsers = onlineUsers.filter(u => u !== socket.username);
      delete userSocketMap[socket.username];
    }

    io.emit("onlineUsers", onlineUsers);
  });
});

// ================= START =================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🔥 Server running on ${PORT}`);
});