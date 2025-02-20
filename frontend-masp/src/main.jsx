import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Search from "./pages/Search";
import Movimentacao from "./pages/Movimentacao";
import "./index.css"; // Importando os estilos globais

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movimentacao" element={<Movimentacao />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
