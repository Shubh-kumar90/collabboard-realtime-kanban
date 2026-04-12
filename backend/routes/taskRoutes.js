const express = require("express");
const router = express.Router();

const { createTask, getTasks, updateTask, deleteTask } = require("../controllers/taskController");

router.post("/create", createTask);
router.get("/:projectId", getTasks);
router.put("/update-status", updateTask);   // ✅ now defined
router.delete("/:id", deleteTask);

module.exports = router;