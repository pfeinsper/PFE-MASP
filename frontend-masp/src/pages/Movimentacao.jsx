// src/pages/Movimentacao.jsx
import React, { useEffect, useState } from "react";
import api, { registrarMovimentacao } from "../services/api";
import LerQR from "../components/LerQR";
import "../index.css";

export default function Movimentacao() {
  // Estado do usuário logado
  const [usuarioNome, setUsuarioNome] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);

  // Estados de obra
  const [obraId, setObraId] = useState(null);
  const [obraNome, setObraNome] = useState("");
  const [obraAutor, setObraAutor] = useState("");

  // Estados de local
  const [localId, setLocalId] = useState(null);
  const [localNome, setLocalNome] = useState("");

  // Tipo de movimentação e mensagens
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState(""); // "success" ou "error"

  // Flags de scanner
  const [lerObra, setLerObra] = useState(false);
  const [lerLocal, setLerLocal] = useState(false);

  // Limpa a mensagem após 5 segundos
  useEffect(() => {
    if (!mensagem) return;
    const id = setTimeout(() => {
      setMensagem("");
      setTipoMensagem("");
    }, 5000);
    return () => clearTimeout(id);
  }, [mensagem]);

  // Ao montar: decodifica o token para pegar id e nome do usuário
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const [, payloadB64] = token.split(".");
        const payload = JSON.parse(atob(payloadB64));
        setUsuarioId(payload.id);
        setUsuarioNome(payload.nome);
      } catch (e) {
        console.error("Não foi possível decodificar o token.", e);
      }
    }
  }, []);

  // Quando escaneia QR da obra
  const handleScanObra = async (codigo) => {
    setLerObra(false);
    try {
      const res = await api.get(`/obras/codigo/${codigo}`);
      const obra = res.data;
      setObraId(obra.id);
      setObraNome(obra.titulo || "");
      setObraAutor(obra.autoria || "");
    } catch {
      setMensagem("Obra não encontrada ou erro no servidor.");
      setTipoMensagem("error");
    }
  };

  // Quando escaneia QR do local
  const handleScanLocal = async (codigo) => {
    setLerLocal(false);
    try {
      const res = await api.get(`/locais/codigo/${codigo}`);
      setLocalId(res.data.id);
      setLocalNome(res.data.nome);
    } catch {
      setMensagem("Local não encontrado ou erro no servidor.");
      setTipoMensagem("error");
    }
  };

  // Ao clicar em Registrar
  const handleRegistrar = async () => {
    if (!obraId || !localId) {
      setMensagem("Escaneie a obra e o local primeiro!");
      setTipoMensagem("error");
      return;
    }
    if (!usuarioId) {
      setMensagem("Usuário não autenticado!");
      setTipoMensagem("error");
      return;
    }
    if (!tipoSelecionado) {
      setMensagem("Selecione o tipo de movimentação (Entrada ou Saída)!");
      setTipoMensagem("error");
      return;
    }

    try {
      await registrarMovimentacao(obraId, localId, tipoSelecionado);
      setMensagem("Movimentação registrada com sucesso!");
      setTipoMensagem("success");
      // limpa campos
      setObraId(null);
      setObraNome("");
      setObraAutor("");
      setLocalId(null);
      setLocalNome("");
      setTipoSelecionado("");
    } catch {
      setMensagem("Erro ao registrar movimentação.");
      setTipoMensagem("error");
    }
  };

  return (
    <div className="container">
      <h1>Movimentação de Obras</h1>

      {/* Usuário logado */}
      <div style={{ marginTop: 20, textAlign: "left" }}>
        <label>Usuário</label>
        <p style={{ fontWeight: "bold", fontSize: "16px", color: "orangered" }}>
          {usuarioNome || "(não autenticado)"}
        </p>
      </div>

      {/* Obra selecionada */}
      <div style={{ marginTop: 20, textAlign: "left" }}>
        <label>Obra selecionada:</label>
        <div style={{ position: "relative" }}>
          <p>
            {obraId
              ? `Nº Tombo: ${obraId} | Título: ${obraNome} | Autoria: ${obraAutor}`
              : "(Nenhuma obra lida)"}
            {obraId && (
              <span
                className="clear-btn"
                style={{ right: "-6px", top: "5px" }}
                onClick={() => {
                  setObraId(null);
                  setObraNome("");
                  setObraAutor("");
                }}
              >
                ×
              </span>
            )}
          </p>
        </div>
        {!obraId && <button onClick={() => setLerObra(true)}>Escanear QR da Obra</button>}
        {lerObra && (
          <div className="overlay">
            <div className="qr-container">
              <LerQR key={Date.now()} onScanResult={handleScanObra} onClose={() => setLerObra(false)} />
            </div>
          </div>
        )}
      </div>

      {/* Local selecionado */}
      <div style={{ marginTop: 20, textAlign: "left" }}>
        <label>Local selecionado:</label>
        <div style={{ position: "relative" }}>
          <p>
            {localId ? `ID: ${localId} | ${localNome}` : "(Nenhum local lido)"}
            {localId && (
              <span
                className="clear-btn"
                style={{ right: "-5px", top: "5px" }}
                onClick={() => {
                  setLocalId(null);
                  setLocalNome("");
                }}
              >
                ×
              </span>
            )}
          </p>
        </div>
        {!localId && <button onClick={() => setLerLocal(true)}>Escanear QR do Local</button>}
        {lerLocal && (
          <div className="overlay">
            <div className="qr-container">
              <LerQR key={Date.now()} onScanResult={handleScanLocal} onClose={() => setLerLocal(false)} />
            </div>
          </div>
        )}
      </div>

      {/* Tipo de movimentação */}
      <div className="select-container" style={{ marginTop: 20 }}>
        <label>Tipo de Movimentação:</label>
        <select
          id="tipoMovimentacao"
          value={tipoSelecionado}
          onChange={(e) => setTipoSelecionado(e.target.value)}
          required
        >
          <option value="" disabled hidden>
            Selecione...
          </option>
          <option value="Entrada">Entrada</option>
          <option value="Saída">Saída</option>
        </select>
      </div>

      {/* Botão Registrar */}
      <button onClick={handleRegistrar} style={{ marginTop: 20 }}>
        Registrar
      </button>

      {/* Mensagem de feedback */}
      {mensagem && (
        <p className={`mensagem ${tipoMensagem}`}>{mensagem}</p>
      )}
    </div>
  );
}