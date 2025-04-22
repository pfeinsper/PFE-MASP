import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import LogoMASP from "../assets/Logo_MASP.png";


export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);

  const toggleMenu = () => setMenuAberto(!menuAberto);

  return (
    <>
      <div className="navbar">
        {/* <h1 className="logo">Capstone Insper - MASP</h1> */}
        <img className="logo" src={LogoMASP} alt="Logo MASP" />
        <div className="hamburguer" onClick={toggleMenu}>
          ☰
        </div>
      </div>

      <div className={`menu-right ${menuAberto ? "open" : ""}`}>
        <div className="menu-content">
          <span className="close-btn" onClick={toggleMenu}>×</span>
          <Link to="/movimentacao" onClick={toggleMenu}>Movimentação</Link>
          <Link to="/gerar-qr" onClick={toggleMenu}>Gerar QR Code</Link>
        </div>
      </div>
    </>
  );
}
