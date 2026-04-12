const express = require("express");
const router = express.Router();

const { createProject, addMember, getProjects } = require("../controllers/projectController");
const { isAuthenticated, isAdmin } = require("../middleware/authMiddleware");

// Create project (Admin only)
router.post("/create", isAuthenticated, isAdmin, createProject);

// Add member (Admin only)
router.post("/add-member", isAuthenticated, isAdmin, addMember);

// Get projects (All users)
router.get("/", isAuthenticated, getProjects);

module.exports = router;