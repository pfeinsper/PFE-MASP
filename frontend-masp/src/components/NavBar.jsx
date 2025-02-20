import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Importando o CSS do Navbar

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <div className="navbar">
        <h1>Capstone Insper - MASP</h1>
        <div
          className="hamburguer"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          ☰
        </div>
      </div>

      {menuAberto && (
        <div className="menu">
          <Link to="/" onClick={() => setMenuAberto(false)}>Login</Link>
          <Link to="/search" onClick={() => setMenuAberto(false)}>Pesquisar Obras</Link>
          <Link to="/movimentacao" onClick={() => setMenuAberto(false)}>Movimentação</Link>
        </div>
      )}
    </>
  );
}
