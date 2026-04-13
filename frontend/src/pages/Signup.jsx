import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await API.post("/api/auth/signup", { name, email, password });
      alert("Account created");
      navigate("/");
    } catch {
      alert("Signup failed");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", height: "80vh", alignItems: "center" }}>
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        width: "300px"
      }}>
        <h2>Signup</h2>

        <input placeholder="Name" onChange={e => setName(e.target.value)} style={inputStyle}/>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} style={inputStyle}/>
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={inputStyle}/>

        <button onClick={handleSignup} style={btnStyle}>Signup</button>
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
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};