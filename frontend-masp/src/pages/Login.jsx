import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../index.css";

export default function Login() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/login", { nome, senha });
      localStorage.setItem("token", res.data.token);
      navigate("/movimentacao");
    } catch (err) {
      console.error("Erro no login:", err);
      setErro("Nome ou senha inválidos.");
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <p className="TextoNormal">Realize seu login para acessar o site.</p>
      <input
        type="text"
        placeholder="Usuário"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      <button onClick={handleLogin}>Entrar</button>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}
