import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../index.css";

export default function Login() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [lembrar, setLembrar] = useState(false);

  useEffect(() => {
    const nomeSalvo = localStorage.getItem("nome_usuario");
    if (nomeSalvo) {
      setNome(nomeSalvo);
      setLembrar(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await api.post("/login", { nome, senha });
      localStorage.setItem("token", res.data.token);

      if (lembrar) {
        localStorage.setItem("nome_usuario", nome);
      } else {
        localStorage.removeItem("nome_usuario");
      }

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
      <div
        style={{
          marginTop: 10,
          fontSize: "16px",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          width: "100%",
          whiteSpace: "nowrap",
          justifyContent: "flex-end", // Alinha à direita
        }}
      >
        <label
          htmlFor="checkboxLembrar"
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          Lembre de mim{" "}
          <input
            type="checkbox"
            id="checkboxLembrar"
            checked={lembrar}
            onChange={(e) => setLembrar(e.target.checked)}
            style={{ verticalAlign: "middle", marginLeft: "8px" }}
          />
        </label>
      </div>
      <button
        onClick={handleLogin}
        style={{ marginTop: 8, width: "100%", padding: "10px" }}
      >
        Entrar
      </button>
      {erro && <p style={{ color: "red" }}>{erro}</p>}
    </div>
  );
}
