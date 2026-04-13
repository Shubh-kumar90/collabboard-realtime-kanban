import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Board from "./pages/Board";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>   {/* ✅ ALL ROUTES MUST BE INSIDE THIS */}

          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/board/:id" element={<Board />} />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;