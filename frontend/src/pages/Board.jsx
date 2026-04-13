import { useEffect, useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import API from "../services/api";
import socket from "../socket/socket";
import { useParams } from "react-router-dom";

export default function Board() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const { id: projectId } = useParams();
  const [selectedTask, setSelectedTask] = useState(null);

  // 🎨 Column colors
  const columnColors = {
    todo: "#fee2e2",
    inprogress: "#fef3c7",
    done: "#dcfce7"
  };

  // 📥 Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await API.get(`/api/tasks/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  }, [projectId]);

  // 🔄 Load + realtime
  useEffect(() => {
    fetchTasks();

    socket.on("taskUpdated", (data) => {
      setTasks(prev =>
        prev.map(t =>
          t.id === data.taskId ? { ...t, status: data.status } : t
        )
      );
    });

    return () => socket.off("taskUpdated");
  }, [fetchTasks]);

  // ➕ Create task
  const createTask = async () => {
    if (!newTask) return;

    await API.post("/api/tasks/create", {
      title: newTask,
      description: "demo",
      projectId,
      assignedTo: 1
    });

    setNewTask("");
    fetchTasks();
  };

  // ❌ Delete task
  const deleteTask = async (taskId) => {
    await API.delete(`/api/tasks/${taskId}`);
    fetchTasks();
  };

  // 🔄 Update task
  const updateTask = async (taskId, status) => {
    await API.put("/api/tasks/update-status", { taskId, status });
  };

  // 🖱 Drag
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const taskId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;

    updateTask(taskId, newStatus);
  };

  const columns = ["todo", "inprogress", "done"];

  return (
    <div style={{
      padding: "30px",
      background: "#f0f4f8",
      minHeight: "100vh"
    }}>

      {/* 🔥 INPUT */}
      <div style={{
        marginBottom: "25px",
        display: "flex",
        gap: "10px"
      }}>
        <input
          placeholder="Enter a task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            flex: 1
          }}
        />
        <button
          onClick={createTask}
          style={{
            padding: "12px 18px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          + Add Task
        </button>
      </div>

      {/* 🔥 BOARD */}
      <div style={{ display: "flex", gap: "20px" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map(col => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: columnColors[col],
                    padding: "15px",
                    width: "280px",
                    minHeight: "450px",
                    borderRadius: "12px"
                  }}
                >
                  <h3 style={{ textTransform: "capitalize" }}>{col}</h3>

                  {tasks
                    .filter(t => t.status === col)
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
                            style={{
                              padding: "12px",
                              background: "white",
                              borderRadius: "10px",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                              marginBottom: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              ...provided.draggableProps.style
                            }}
                          >
                            <span>{task.title}</span>
                            <button
                              onClick={() => deleteTask(task.id)}
                              style={{
                                border: "none",
                                background: "red",
                                color: "white",
                                borderRadius: "5px",
                                cursor: "pointer"
                              }}
                            >
                              X
                            </button>
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
      </div>

      {/* 🔥 LOGOUT */}
      <button
        onClick={async () => {
          await API.post("/api/auth/logout");
          window.location.href = "/";
        }}
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "black",
          color: "white",
          borderRadius: "6px"
        }}
      >
        Logout
      </button>
    </div>
  );
}