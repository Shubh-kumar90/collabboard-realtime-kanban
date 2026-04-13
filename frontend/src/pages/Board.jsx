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

  useEffect(() => {
    fetchTasks();
    fetchUsers();

    socket.emit("userOnline", user?.name || "Guest");

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });


    socket.on("notification", (data) => {
  setNotifications((prev) => [
    { ...data, time: new Date() },
    ...prev,
  ]);
});

    // ✅ FIXED ACTIVITY (NO DUPLICATE)
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
  }, [fetchTasks]);

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

  const updateTaskDetails = async () => {
    await API.put("/api/tasks/update", selectedTask);
    setSelectedTask(null);
    fetchTasks();
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const taskId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;

    updateTask(taskId, newStatus);
  };

  // ================= AVATAR =================
  const getInitial = (name) => name?.charAt(0).toUpperCase();

  return (
    <div style={{ padding: "20px" }}>

      {/* ONLINE USERS */}
      <div style={{ marginBottom: "15px" }}>
        <strong>Online:</strong>
        {onlineUsers.map((u, i) => (
          <span key={i} style={{ marginLeft: "10px" }}>🟢 {u}</span>
        ))}
      </div>

      <div style={{ position: "absolute", top: "20px", right: "20px" }}>
  <button onClick={() => setShowNotifications(!showNotifications)}>
    🔔 ({notifications.length})
  </button>

  {showNotifications && (
    <div style={{
      position: "absolute",
      right: 0,
      top: "40px",
      width: "250px",
      background: "white",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      padding: "10px",
      maxHeight: "300px",
      overflowY: "auto"
    }}>
      <h4>Notifications</h4>

      {notifications.length === 0 && <div>No notifications</div>}

      {notifications.map((n, i) => (
        <div key={i} style={{
          padding: "8px",
          borderBottom: "1px solid #eee"
        }}>
          <div>{n.message}</div>
          <small style={{ color: "gray" }}>
            {new Date(n.time).toLocaleTimeString()}
          </small>
        </div>
      ))}
    </div>
  )}
</div>

      {/* INPUT */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          placeholder="Enter task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Assign User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <button onClick={createTask}>Add</button>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    width: "250px",
                    padding: "10px",
                    minHeight: "400px",
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

                  {tasks
                    .filter((t) => t.status === col)
                    .map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => setSelectedTask(task)}
                            style={{
                              background: "white",
                              padding: "12px",
                              borderRadius: "10px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              marginBottom: "12px",
                              cursor: "pointer",
                              ...provided.draggableProps.style,
                            }}
                          >
                            <strong>{task.title}</strong>

                            {/* PRIORITY */}
                            <div style={{ marginTop: "5px" }}>
                              {task.priority === "low" && <span style={{ color: "green" }}>🟢 Low</span>}
                              {task.priority === "medium" && <span style={{ color: "orange" }}>🟡 Medium</span>}
                              {task.priority === "high" && <span style={{ color: "red" }}>🔴 High</span>}
                            </div>

                            {/* DUE DATE */}
                            {task.due_date && (
                              <div style={{ fontSize: "12px", marginTop: "5px" }}>
                                📅 {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}

                            {/* USER */}
                            <div style={{ marginTop: "5px" }}>
                              <span style={{
                                display: "inline-block",
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                background: "#2563eb",
                                color: "white",
                                textAlign: "center",
                                lineHeight: "30px",
                                marginRight: "5px"
                              }}>
                                {getInitial(task.user_name || "U")}
                              </span>
                              {task.user_name || "Unassigned"}
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
        <div style={{ width: "220px" }}>
          <h3>Activity</h3>
          {activity.map((a, i) => <div key={i}>{a}</div>)}
        </div>
      </div>

      {/* MODAL */}
      {selectedTask && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)"
        }}>
          <div style={{
            background: "white",
            padding: "25px",
            margin: "100px auto",
            width: "320px",
            borderRadius: "10px"
          }}>

            <h3>Edit Task</h3>

            <input
              value={selectedTask.title}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, title: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <select
              value={selectedTask.priority || "low"}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, priority: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px" }}
            >
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>

            <input
              type="date"
              value={selectedTask.due_date || ""}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, due_date: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <select
              value={selectedTask.assigned_to || ""}
              onChange={(e) =>
                setSelectedTask({ ...selectedTask, assigned_to: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px" }}
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>

            <button onClick={updateTaskDetails}>Save</button>
            <button onClick={() => setSelectedTask(null)}>Cancel</button>

          </div>
        </div>
      )}
    </div>
  );
}