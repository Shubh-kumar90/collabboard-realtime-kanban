import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await API.post("/api/auth/login", { email, password });
      localStorage.setItem("user", JSON.stringify({ email }));
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
      background: "#f0f4f8"
    }}>
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        width: "320px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          CollabBoard Login 🚀
        </h2>

        <input
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleLogin} style={btnStyle}>
          Login
        </button>

        {/* 🔗 Signup link */}
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            style={{ color: "blue", cursor: "pointer" }}
          >
            Signup
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  borderRadius: "6px",
  border: "1px solid #ccc"
};

const btnStyle = {
  width: "100%",
  padding: "10px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
};