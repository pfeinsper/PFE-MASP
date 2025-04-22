// src/pages/Movimentacao.jsx
import React, { useEffect, useState } from "react";
import api, { registrarMovimentacao } from "../services/api";
import LerQR from "../components/LerQR";
import "../index.css";

export default function Movimentacao() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const [filtrandoUsuarios, setFiltrandoUsuarios] = useState([]);

  const [obraId, setObraId] = useState(null);
  const [obraNome, setObraNome] = useState("");

  const [obraAutor, setObraAutor] = useState("");

  const [localId, setLocalId] = useState(null);
  const [localNome, setLocalNome] = useState("");

  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [lerObra, setLerObra] = useState(false);
  const [lerLocal, setLerLocal] = useState(false);

  useEffect(() => {
    api
      .get("/usuarios")
      .then((res) => {
        console.log("Usuários recebidos:", res.data);
        setUsuarios(res.data);
      })
      .catch((err) => console.error("Erro ao buscar usuários:", err));
  }, []);

  const handleFiltrarUsuarios = (termo) => {
    setUsuarioSelecionado(termo);
    if (termo.length > 0 && usuarios.length > 0) {
      const filtrados = usuarios.filter((u) =>
        u.nome.toLowerCase().includes(termo.toLowerCase())
      );
      setFiltrandoUsuarios(filtrados);
    } else {
      setFiltrandoUsuarios([]);
    }
  };

  const handleSelecionarUsuario = (user) => {
    setUsuarioSelecionado(user.nome);
    setUsuarioId(user.id);
    setFiltrandoUsuarios([]);
  };

  const handleScanObra = async (codigo) => {
    console.log("QR da obra detectado:", codigo);
    setLerObra(false);
    try {
      const res = await api.get(`/obras/codigo/${codigo}`);
      const obra = res.data;
      setObraId(obra.id);
      setObraNome(obra.titulo || obra.nome || "");
      setObraAutor(obra.autoria || "");
    } catch (err) {
      console.error("Erro ao buscar obra pelo código:", err);
      setMensagem("Obra não encontrada ou erro no servidor.");
    }
  };

  const handleScanLocal = async (codigo) => {
    console.log("QR do local detectado:", codigo);
    setLerLocal(false);
    try {
      const res = await api.get(`/locais/codigo/${codigo}`);
      const local = res.data;
      setLocalId(local.id);
      setLocalNome(local.nome);
    } catch (err) {
      console.error("Erro ao buscar local pelo código:", err);
      setMensagem("Local não encontrado ou erro no servidor.");
    }
  };

  const handleRegistrar = async () => {
    if (!obraId || !localId) {
      setMensagem("Escaneie a obra e o local primeiro!");
      return;
    }
    if (!usuarioId) {
      setMensagem("Selecione um usuário!");
      return;
    }
    if (!tipoSelecionado) {
      setMensagem("Selecione o tipo de movimentação (Entrada ou Saída)!");
      return;
    }

    const payload = {
      obra_id: obraId,
      local_id: localId,
      usuario_id: usuarioId,
      tipo_movimentacao: tipoSelecionado,
    };

    console.log("Enviando movimentação:", payload);

    try {
      await registrarMovimentacao(obraId, localId, usuarioId, tipoSelecionado);
      setMensagem("Movimentação registrada com sucesso!");

      setObraId(null);
      setObraNome("");
      setLocalId(null);
      setLocalNome("");
      setUsuarioSelecionado("");
      setUsuarioId(null);
      setTipoSelecionado("");
    } catch (error) {
      console.error("Erro ao registrar movimentação:", error);
      setMensagem("Erro ao registrar movimentação.");
    }
  };

  return (
    <div className="container">
      <h1>Movimentação de Obras</h1>

      {/* ---------- AUTOCOMPLETE ---------- */}
      <div className="autocomplete-container">
        <label style={{ display: "block", textAlign: "left" }}>Usuário</label>
        <input
          type="text"
          placeholder="Digite o nome do usuário"
          value={usuarioSelecionado}
          onChange={(e) => {
            setUsuarioId(null);
            handleFiltrarUsuarios(e.target.value);
          }}
          id="usuarioInput"
        />
        {usuarioSelecionado && (
          <span
            className="clear-btn"
            onClick={() => {
              setUsuarioSelecionado("");
              setUsuarioId(null);
            }}
          >
            ×
          </span>
        )}
        {filtrandoUsuarios.length > 0 && (
          <ul className="autocomplete-list mostrar">
            {filtrandoUsuarios.map((u) => (
              <li key={u.id} onClick={() => handleSelecionarUsuario(u)}>
                {u.nome}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------- QR CODE OBRA ---------- */}
      <div style={{ marginTop: 20 }}>
        <label style={{ display: "block", textAlign: "left" }}>Obra selecionada:</label>
        <div style={{ position: "relative" }}>
          <p>
            {obraId ? `Nº Tombo: ${obraId} | Título: ${obraNome} | Autoria: ${obraAutor}` : "(Nenhuma obra lida)"}
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

        {!obraId && (
          <button onClick={() => setLerObra(true)}>Escanear QR da Obra</button>
        )}
        {lerObra && (
          <div className="overlay">
            <div className="qr-container">
              <LerQR
                key={Date.now()}
                onScanResult={handleScanObra}
                onClose={() => setLerObra(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ---------- QR CODE LOCAL ---------- */}
      <div style={{ marginTop: 20 }}>
        <label style={{ display: "block", textAlign: "left" }}>Local selecionado:</label>
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

        {!localId && (
          <button onClick={() => setLerLocal(true)}>Escanear QR do Local</button>
        )}
        {lerLocal && (
          <div className="overlay">
            <div className="qr-container">
              <LerQR
                key={Date.now()}
                onScanResult={handleScanLocal}
                onClose={() => setLerLocal(false)}
              />
            </div>
          </div>
        )}
      </div>


      {/* ---------- TIPO MOVIMENTAÇÃO ---------- */}
      <div className="select-container" style={{ marginTop: 20 }}>
        <label style={{ display: "block", textAlign: "left" }}>
          Tipo de Movimentação:
        </label>
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

      {/* ---------- BOTÃO REGISTRAR ---------- */}
      <button onClick={handleRegistrar} style={{ marginTop: 20 }}>
        Registrar
      </button>

      {mensagem && <p className="mensagem">{mensagem}</p>}
    </div>
  );
}
