const db = require("../config/db");

// CREATE TASK
exports.createTask = (req, res) => {
 const { title, description, projectId, assignedTo } = req.body;

const sql = `
  INSERT INTO tasks (title, description, project_id, assigned_to)
  VALUES (?, ?, ?, ?)
`;

db.query(sql, [
  title,
  description,
  projectId,
  assignedTo || null   // ✅ SAFE FIX
], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });

    res.json({ message: "Task created", taskId: result.insertId });
  });
};

// GET TASKS (WITH USER JOIN)
exports.getTasks = (req, res) => {
  const { projectId } = req.params;

  const sql = `
    SELECT tasks.*, users.name AS user_name
    FROM tasks
    LEFT JOIN users ON tasks.assigned_to = users.id
    WHERE project_id = ?
  `;

  db.query(sql, [projectId], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });

    res.json(results);
  });
};

// UPDATE STATUS
exports.updateTask = (req, res) => {
  const { taskId, status } = req.body;

  db.query("UPDATE tasks SET status=? WHERE id=?", [status, taskId], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });

    const io = req.app.get("io");

    io.emit("taskUpdated", {
      taskId,
      status,
      user: "Shubham"
    });

    res.json({ message: "Task updated" });
  });
};

// DELETE TASK
exports.deleteTask = (req, res) => {
  const taskId = req.params.id;

  db.query("DELETE FROM tasks WHERE id=?", [taskId], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });

    const io = req.app.get("io");
    io.emit("taskDeleted", taskId);

    res.json({ message: "Task deleted" });
  });
};

// UPDATE TASK DETAILS (FIXED)
exports.updateTaskDetails = (req, res) => {
  const { id, title, description, priority, due_date, assigned_to } = req.body;

  const sql = `
    UPDATE tasks
    SET title=?, description=?, priority=?, due_date=?, assigned_to=?
    WHERE id=?
  `;

  db.query(sql, [title, description, priority, due_date, assigned_to, id], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });

    const io = req.app.get("io");

    io.emit("taskUpdated", {
      taskId: id,
      status: "updated",
      user: "Shubham"
    });

    res.json({ message: "Task updated" });
  });
};