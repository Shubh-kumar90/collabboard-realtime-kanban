import axios from "axios";

const API = axios.create({
baseURL: "https://collabboard-realtime-kanban.onrender.com",
  withCredentials: true // 🔥 IMPORTANT (for sessions)
});

export default API;