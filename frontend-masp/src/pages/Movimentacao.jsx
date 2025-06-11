import React, { useEffect, useState } from "react";
import api, { registrarMovimentacao } from "../services/api";
import LerQR from "../components/LerQR";
import "../index.css";

export default function Movimentacao() {
  const [usuarioNome, setUsuarioNome] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);

  const [obras, setObras] = useState([]); 
  const [localId, setLocalId] = useState(null);
  const [localNome, setLocalNome] = useState("");
  const [notasAdicionais, setNotasAdicionais] = useState("");

  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("");

  const [lerObra, setLerObra] = useState(false);
  const [lerLocal, setLerLocal] = useState(false);

  const [registrando, setRegistrando] = useState(false);
  const [escaneandoObra, setEscaneandoObra] = useState(false);


  useEffect(() => {
    if (!mensagem) return;
    const id = setTimeout(() => {
      setMensagem("");
      setTipoMensagem("");
    }, 5000);
    return () => clearTimeout(id);
  }, [mensagem]);

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

  const handleScanObra = async (codigo) => {
    if (escaneandoObra) return; 
    setEscaneandoObra(true);
    setLerObra(false);

    try {
      const res = await api.get(`/obras/codigo/${codigo}`);
      const nova = res.data;
      const jaExiste = obras.some((o) => o.id === nova.id);
      if (jaExiste) {
        setMensagem("Essa obra já foi escaneada.");
        setTipoMensagem("error");
        return;
      }
      setObras([...obras, nova]);
    } catch {
      setMensagem("Obra não encontrada ou erro no servidor.");
      setTipoMensagem("error");
    } finally {
      setEscaneandoObra(false);
    }
  };



  const handleScanLocal = async (codigo) => {
    setLerLocal(false);
    try {
      const codigoLimpo = codigo.trim();
      const res = await api.get(`/locais/codigo/${encodeURIComponent(codigoLimpo)}`);
      setLocalId(res.data.id);
      setLocalNome(res.data.nome);
    } catch {
      setMensagem("Local não encontrado ou erro no servidor.");
      setTipoMensagem("error");
    }
  };

  const handleRemoverObra = (index) => {
    const novas = [...obras];
    novas.splice(index, 1);
    setObras(novas);
  };

  const handleRegistrar = async () => {
    if (obras.length === 0 || !localId) {
      setMensagem("Escaneie pelo menos uma obra e um local!");
      setTipoMensagem("error");
      return;
    }
    if (!usuarioId) {
      setMensagem("Usuário não autenticado!");
      setTipoMensagem("error");
      return;
    }
    if (!tipoSelecionado) {
      setMensagem("Selecione o tipo de movimentação!");
      setTipoMensagem("error");
      return;
    }

    setRegistrando(true);

    try {
      for (const obra of obras) {
        await registrarMovimentacao(
          obra.id,
          localId,
          tipoSelecionado,
          notasAdicionais
        );
      }
      setMensagem("Movimentações registradas com sucesso!");
      setTipoMensagem("success");
      setObras([]);
      setLocalId(null);
      setLocalNome("");
      setTipoSelecionado("");
      setNotasAdicionais("");     
    } catch {
      setMensagem("Erro ao registrar movimentações.");
      setTipoMensagem("error");
    } finally {
      setRegistrando(false);
    }
  };


  return (
    <div className="container">
      <h1>Movimentação de Obras</h1>

      <div style={{ marginTop: 20, textAlign: "left" }}>
        <label>Usuário</label>
        <p style={{ fontStyle: "italic", color: "orangered" }}>
          {usuarioNome || "(não autenticado)"}
        </p>
      </div>

      {/* Obras escaneadas */}
      <div style={{ marginTop: 20, textAlign: "left" }}>
        <label>Obras escaneadas:</label>
        {obras.length > 0 ? (
          <ul style={{ paddingLeft: 20 }}>
            {obras.map((obra, index) => (
              <li key={index} style={{ marginBottom: 20, position: "relative" }}>
                <div style={{ fontStyle: "italic", color: "orangered" }}>
                  Nº Tombo: {obra.id} | {obra.titulo} | {obra.autoria || "Desconhecido"}
                  <span className="clear-btn" onClick={() => handleRemoverObra(index)}>
                    ×
                  </span>
                </div>

                {obra.imageUrl && obras.length <= 3 && (
                  <div style={{ textAlign: "center", marginTop: 8 }}>
                    <img
                      src={obra.imageUrl}
                      alt={obra.titulo}
                      style={{
                        display: "block",
                        margin: "0 auto",
                        maxWidth: 200,
                        border: "1px solid #ddd",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>(Nenhuma obra lida)</p>
        )}
        <button
          onClick={() => setLerObra(true)}
          disabled={escaneandoObra}
          style={{ marginTop: 10, opacity: escaneandoObra ? 0.6 : 1 }}
        >
          {escaneandoObra ? "Aguardando leitura..." : "Escanear QR da Obra"}
        </button>
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

      {/* Local */}
      <div style={{ marginTop: 20, textAlign: "left" }}>
        <label>Local escaneado:</label>
        <p style={{ position: "relative" }}>
          {localId ? (
            <>
              <em>ID: {localId}</em> | {localNome}
              <span
                className="clear-btn"
                onClick={() => {
                  setLocalId(null);
                  setLocalNome("");
                }}
                title="Limpar local"
              >
                ×
              </span>
            </>
          ) : (
            "(Nenhum local lido)"
          )}
        </p>
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

      <div style={{ marginTop: 20, textAlign: "left" }}>
        <label>Notas Adicionais:</label>
        <textarea
          className="fullWidthInput"
          rows={3}
          value={notasAdicionais}
          onChange={e => setNotasAdicionais(e.target.value)}
          placeholder="Observações (ex: estado da obra, cuidados...)"
        />
      </div>

      <button
        onClick={handleRegistrar}
        disabled={registrando}
        style={{ marginTop: 20, opacity: registrando ? 0.6 : 1 }}
      >
        {registrando ? "Registrando..." : "Registrar"}
      </button>

      {mensagem && <p className={`mensagem ${tipoMensagem}`}>{mensagem}</p>}
    </div>
  );
}
