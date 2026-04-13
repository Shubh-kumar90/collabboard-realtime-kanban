import { useEffect, useState } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get("/api/projects");
      setProjects(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const createProject = async () => {
    try {
      await API.post("/api/projects/create", { name: projectName });
      setProjectName("");
      fetchProjects(); // refresh
    } catch (err) {
      alert("Only admin can create project");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      <input
        placeholder="New Project Name"
        value={projectName}
        onChange={e => setProjectName(e.target.value)}
      />
      <button onClick={createProject}>Create</button>

      <h3>Projects:</h3>


      

      {projects.map(p => (
        <div key={p.id}>
          <Link to={`/board/${p.id}`}>{p.name}</Link>
        </div>
      ))}
    </div>
  );
}