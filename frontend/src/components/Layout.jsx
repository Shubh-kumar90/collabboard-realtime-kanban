export default function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* 🔵 HEADER */}
      <header style={{
        background: "#1e293b",
        color: "white",
        padding: "15px 30px",
        fontSize: "20px",
        fontWeight: "bold"
      }}>
        CollabBoard 🚀
      </header>

      {/* 🧠 MAIN CONTENT */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* ⚫ FOOTER */}
      <footer style={{
        background: "#1e293b",
        color: "white",
        padding: "10px",
        textAlign: "center"
      }}>
        © 2026 CollabBoard | Built by Shubham
      </footer>

    </div>
  );
}