import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../index.css";

export default function Search() {
  const [termo, setTermo] = useState("");           // o que o usuário vê no input
  const [filtro, setFiltro] = useState("");         // só muda quando o usuário digita
  const [obra, setObra] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);

  // 1) Busca sugestões quando 'filtro' muda
  useEffect(() => {
    if (filtro.length > 0) {
      api
        .get(`/obras?search=${encodeURIComponent(filtro)}`)
        .then((res) => setSugestoes(res.data))
        .catch((err) => console.error("Erro ao buscar sugestões:", err));
    } else {
      setSugestoes([]);
    }
  }, [filtro]);

  // 2) Busca obra + histórico
  const buscarObraEHistorico = async () => {
    try {
      const res = await api.get(`/obras?search=${encodeURIComponent(termo)}`);
      if (res.data.length > 0) {
        const obraSel = res.data[0];
        setObra(obraSel);

        const movs = await api.get(`/movimentacoes/obra/${obraSel.id}`);
        setMovimentacoes(movs.data.slice(0, 10));
      } else {
        setObra(null);
        setMovimentacoes([]);
      }
    } catch (err) {
      console.error("Erro ao buscar obra e histórico:", err);
    }
  };

  // 3) Quando o usuário clica numa sugestão
  const handleSelecionarSugestao = (obraSel) => {
    setTermo(obraSel.titulo);  // preenche o input
    setFiltro("");             // impede novo fetch de sugestões
    setSugestoes([]);          // limpa a lista
  };

  // 4) Botão de limpar tudo
  const handleLimpar = () => {
    setTermo("");
    setFiltro("");
    setObra(null);
    setMovimentacoes([]);
  };

  return (
    <div className="container">
      <h1>Buscar Obra</h1>

      <p className="TextoNormal">Digite o <strong>ID da obra</strong> ou o<strong> nome da obra</strong> para mostrar o histórico das movimentações.</p>
      
      <div className="autocomplete-container" style={{ position: "relative" }}>
        <input
          type="text"
          className="fullWidthInput"
          placeholder="Digite o nome ou ID da obra"
          value={termo}
          onChange={(e) => {
            setTermo(e.target.value);
            setFiltro(e.target.value);  // só aqui mexe em 'filtro'
          }}
        />

        {/* X para limpar */}
        {termo && (
          <span className="clear-btn" onClick={handleLimpar}>
            ×
          </span>
        )}

        {/* Lista de sugestões */}
        {sugestoes.length > 0 && (
          <ul className="autocomplete-list mostrar">
            {sugestoes.map((o) => (
              <li key={o.id} onClick={() => handleSelecionarSugestao(o)}>
                {o.titulo}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={buscarObraEHistorico}>Buscar</button>

      {/* Resultado */}
      {obra && (
        <div style={{ marginTop: 30, textAlign: "left" }}>
          <h2 style={{ color: "#d50000" }}>{obra.titulo}</h2>
          <p><em style={{ color: "orangered" }}>ID: {obra.id}</em></p>
          <p>
            <strong style={{ color: "orangered" }}>Autoria:</strong>{" "}
            <em style={{ color: "orangered" }}>{obra.autoria || "Desconhecida"}</em>
          </p>

          <h3 style={{ marginTop: 30 }}>Últimas movimentações:</h3>
          {movimentacoes.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "orangered" }}>
              (Nenhuma movimentação encontrada)
            </p>
          ) : (
            <ul className="movimentacoes-lista">
              {movimentacoes.map((m, i) => (
                <li key={i} className="mov-card">
                  <div>
                    <span className="tipo">{m.tipo_movimentacao}</span>{" "}
                    <span className="data">
                      {new Date(m.data).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div>
                    <strong>Usuário:</strong> {m.usuario_nome}
                    <br />
                    <strong>Local:</strong> {m.local_nome}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
