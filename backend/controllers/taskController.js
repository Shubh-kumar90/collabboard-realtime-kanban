const db = require("../config/db");

// CREATE TASK
exports.createTask = (req, res) => {
  const { title, description, projectId, assignedTo } = req.body;

  const sql = `
    INSERT INTO tasks (title, description, project_id, assigned_to)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [title, description, projectId, assignedTo], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "DB error" });
    }

    res.json({ message: "Task created", taskId: result.insertId });
  });
};

// GET TASKS BY PROJECT
exports.getTasks = (req, res) => {
  const { projectId } = req.params;

  const sql = "SELECT * FROM tasks WHERE project_id = ?";

  db.query(sql, [projectId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "DB error" });
    }

    res.json(results);
  });
};

// UPDATE TASK STATUS (KANBAN MOVE)
exports.updateTask = (req, res) => {
  const { taskId, status } = req.body;

  const sql = "UPDATE tasks SET status = ? WHERE id = ?";

  db.query(sql, [status, taskId], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "DB error" });
    }

    // 🔥 Emit real-time update
    const io = req.app.get("io");
    io.emit("taskUpdated", { taskId, status });

    res.json({ message: "Task updated" });
  });
};


exports.deleteTask = (req, res) => {
  const taskId = req.params.id;

  const sql = "DELETE FROM tasks WHERE id = ?";

  db.query(sql, [taskId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "DB error" });
    }

    res.json({ message: "Task deleted" });
  });
};