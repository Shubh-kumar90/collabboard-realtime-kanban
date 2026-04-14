import { useEffect, useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import API from "../services/api";
import socket from "../socket/socket";
import { useParams } from "react-router-dom";

export default function Board() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const { id: projectId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const columns = ["todo", "inprogress", "done"];

  // ================= FETCH =================
  const fetchTasks = useCallback(async () => {
    const res = await API.get(`/api/tasks/${projectId}`);
    setTasks(res.data);
  }, [projectId]);

  const fetchUsers = async () => {
    const res = await API.get("/api/users");
    setUsers(res.data);
  };

  // ================= SOCKET =================
  useEffect(() => {
    fetchTasks();
    fetchUsers();

    // ✅ FIX: unique identity
    socket.emit("userOnline", user?.email || "Guest");

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("notification", (data) => {
      setNotifications((prev) => [
        { ...data, time: new Date() },
        ...prev,
      ]);
    });

    socket.on("taskUpdated", (data) => {
      fetchTasks();

      setActivity((prev) => {
        const log = `${data.user} updated Task ${data.taskId}`;
        if (prev[0] === log) return prev;
        return [log, ...prev];
      });
    });

    socket.on("taskDeleted", (id) => {
      fetchTasks();
      setActivity((prev) => [`Task ${id} deleted`, ...prev]);
    });

    return () => {
      socket.off("taskUpdated");
      socket.off("taskDeleted");
      socket.off("onlineUsers");
      socket.off("notification");
    };
  }, [fetchTasks,user?.email]);

  // ================= CREATE =================
  const createTask = async () => {
    if (!newTask) return;

    const res = await API.post("/api/tasks/create", {
      title: newTask,
      description: "demo",
      projectId,
      assignedTo: selectedUser || null,
    });

    setActivity((prev) => [`Created Task ${res.data.taskId}`, ...prev]);

    setNewTask("");
    fetchTasks();
  };

  // ================= DELETE =================
  const deleteTask = async (taskId, e) => {
    e.stopPropagation();
    await API.delete(`/api/tasks/${taskId}`);
    fetchTasks();
  };

  // ================= UPDATE =================
  const updateTask = async (taskId, status) => {
    await API.put("/api/tasks/update-status", { taskId, status });
  };

  // const updateTaskDetails = async () => {
  //   await API.put("/api/tasks/update", selectedTask);
  //   setSelectedTask(null);
  //   fetchTasks();
  // };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const taskId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;

    updateTask(taskId, newStatus);
  };

  const getInitial = (name) => name?.charAt(0).toUpperCase();

  // ================= UI =================
  return (
    <div style={{ padding: "20px" }}>

      {/* 🔔 NOTIFICATIONS */}
      <div style={{ position: "absolute", top: "20px", right: "20px" }}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          🔔 ({notifications.length})
        </button>

        {showNotifications && (
          <div style={{
            position: "absolute",
            right: 0,
            top: "40px",
            width: "260px",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            padding: "10px"
          }}>
            <h4>Notifications</h4>

            {notifications.map((n, i) => (
              <div key={i} style={{ borderBottom: "1px solid #eee", padding: "6px" }}>
                <div>{n.message}</div>
                <small>{new Date(n.time).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ONLINE USERS */}
      <div>
        <strong>Online:</strong>
        {onlineUsers.map((u, i) => (
          <span key={i} style={{ marginLeft: "10px" }}>🟢 {u}</span>
        ))}
      </div>

      {/* INPUT */}
      <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
        <input
          placeholder="Enter task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />

        <select onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Assign User</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <button onClick={createTask}>Add</button>
      </div>

      {/* BOARD */}
      <div style={{ display: "flex", gap: "20px" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map(col => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    width: "250px",
                    minHeight: "400px",
                    padding: "10px",
                    borderRadius: "10px",
                    background:
                      col === "todo"
                        ? "#fee2e2"
                        : col === "inprogress"
                        ? "#fef3c7"
                        : "#dcfce7",
                  }}
                >
                  <h3>{col}</h3>

                  {tasks.filter(t => t.status === col).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => setSelectedTask(task)}
                          style={{
                            background: "white",
                            padding: "10px",
                            marginBottom: "10px",
                            borderRadius: "8px",
                            ...provided.draggableProps.style
                          }}
                        >
                          <strong>{task.title}</strong>

                          {/* PRIORITY */}
                          <div>
                            {task.priority === "low" && "🟢 Low"}
                            {task.priority === "medium" && "🟡 Medium"}
                            {task.priority === "high" && "🔴 High"}
                          </div>

                          {/* DATE */}
                          {task.due_date && (
                            <div>📅 {new Date(task.due_date).toLocaleDateString()}</div>
                          )}

                          {/* USER */}
                          <div>
                            {getInitial(task.user_name)} {task.user_name}
                          </div>

                          <button onClick={(e) => deleteTask(task.id, e)}>X</button>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>

        {/* ACTIVITY */}
        <div>
          <h3>Activity</h3>
          {activity.map((a, i) => <div key={i}>{a}</div>)}
        </div>
      </div>
    </div>
  );
}