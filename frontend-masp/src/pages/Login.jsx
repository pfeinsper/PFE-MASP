import React from "react";
import { useNavigate } from "react-router-dom";
import "../index.css"; // Importando os estilos globais

export default function Login() {
  const navigate = useNavigate(); // Hook para navegação entre páginas

  return (
    <div className="container">
      <h1>Login</h1>
      
      {/* Campos de entrada para usuário e senha */}
      <input type="text" placeholder="Usuário" />
      <input type="password" placeholder="Senha" />
      
      {/* Botão de entrada que leva para a página de pesquisa */}
      <button onClick={() => navigate("/search")}>Entrar</button>
    </div>
  );
}
