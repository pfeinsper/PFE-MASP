// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar"; // Importando o Navbar
import Login from "./pages/Login";
import Search from "./pages/Search";
import Movimentacao from "./pages/Movimentacao";

export default function App() {
  return (
    <Router>
      {/* Navbar sempre presente em todas as rotas */}
      <Navbar />

      <Routes>
        {/* <Route path="/" element={<Login />} /> */}
        <Route path="/" element={<Movimentacao />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movimentacao" element={<Movimentacao />} />
      </Routes>
    </Router>
  );
}
