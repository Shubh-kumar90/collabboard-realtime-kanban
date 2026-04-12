const db = require("../config/db");

// CREATE PROJECT (Admin only)
exports.createProject = (req, res) => {
  const { name } = req.body;
  const userId = req.session.user.id;

  const sql = "INSERT INTO projects (name, created_by) VALUES (?, ?)";

  db.query(sql, [name, userId], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });

    const projectId = result.insertId;

    // 🔥 AUTO ADD USER TO PROJECT
    const memberSql = "INSERT INTO project_members (project_id, user_id) VALUES (?, ?)";

    db.query(memberSql, [projectId, userId]);

    res.json({ message: "Project created", projectId });
  });
};

// ADD MEMBER (Admin only)
exports.addMember = (req, res) => {
  const { projectId, userId } = req.body;

  const sql = "INSERT INTO project_members (project_id, user_id) VALUES (?, ?)";

  db.query(sql, [projectId, userId], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "DB error" });
    }

    res.json({ message: "Member added" });
  });
};

// GET USER PROJECTS
exports.getProjects = (req, res) => {
  const userId = req.session.user.id;

  const sql = `
    SELECT p.* FROM projects p
    JOIN project_members pm ON p.id = pm.project_id
    WHERE pm.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "DB error" });
    }

    res.json(results);
  });
};