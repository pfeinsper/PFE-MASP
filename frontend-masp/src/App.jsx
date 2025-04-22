import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/NavBar";
import Login from "./pages/Login";
import Search from "./pages/Search";
import Movimentacao from "./pages/Movimentacao";
import CriarQRCodeManual from "./pages/CriarQRCode";
import "./index.css";

/* ✅ Middleware visual: redireciona se não estiver logado */
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Logout imediato ao recarregar/fechar a aba
      localStorage.removeItem("token");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/movimentacao" element={<RequireAuth><Movimentacao /></RequireAuth>} />
        <Route path="/buscar" element={<RequireAuth><Search /></RequireAuth>} />
        <Route path="/gerar-qr" element={<RequireAuth><CriarQRCodeManual /></RequireAuth>} />
      </Routes>
    </Router>
  );
}
