import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import LogoMASP from "../assets/Logo_MASP.png";

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate(); 

  const toggleMenu = () => setMenuAberto(!menuAberto);

  const handleLogoClick = () => {
    localStorage.removeItem("token");  
    navigate("/");                     
  };

  return (
    <>
      <div className="navbar">
        <img
          className="logo"
          src={LogoMASP}
          alt="Logo MASP"
          style={{ cursor: "pointer" }}
          onClick={handleLogoClick}
        />
        <div className="hamburguer" onClick={toggleMenu}>
          ☰
        </div>
      </div>

      <div className={`menu-right ${menuAberto ? "open" : ""}`}>
        <div className="menu-content">
          <span className="close-btn" onClick={toggleMenu}>×</span>
          <Link to="/movimentacao" onClick={toggleMenu}>Movimentação</Link>
          <Link to="/buscar" onClick={toggleMenu}>Buscar Obra</Link>
          <Link to="/gerar-qr" onClick={toggleMenu}>Gerar QR Code</Link>
          {/* <Link to="/consulta" onClick={toggleMenu}>Consulta de Movimentações</Link> */}
        </div>
      </div>
    </>
  );
}