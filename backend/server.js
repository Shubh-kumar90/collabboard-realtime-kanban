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

// ================= SOCKET =================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

app.set("io", io);

// ================= MIDDLEWARE =================
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(session({
  secret: "collab_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: "lax"
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