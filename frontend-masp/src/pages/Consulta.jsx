import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../index.css";

export default function Consulta() {
  // Usuário autocomplete
  const [usuarioTermo, setUsuarioTermo] = useState("");
  const [usuarioIdSelecionado, setUsuarioIdSelecionado] = useState("");
  const [usuarioSugestoes, setUsuarioSugestoes] = useState([]);

  // Obra autocomplete
  const [obraTermo, setObraTermo] = useState("");
  const [obraIdSelecionada, setObraIdSelecionada] = useState("");
  const [obraSugestoes, setObraSugestoes] = useState([]);

  // Local autocomplete
  const [localTermo, setLocalTermo] = useState("");
  const [localIdSelecionado, setLocalIdSelecionado] = useState("");
  const [localSugestoes, setLocalSugestoes] = useState([]);

  const [tipoMovimentacao, setTipoMovimentacao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Resultados
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar sugestões Usuários
  useEffect(() => {
    if (usuarioTermo.length === 0) {
      setUsuarioSugestoes([]);
      setUsuarioIdSelecionado("");
      return;
    }
    api.get(`/usuarios?search=${encodeURIComponent(usuarioTermo)}`)
      .then(res => setUsuarioSugestoes(res.data))
      .catch(() => setUsuarioSugestoes([]));
  }, [usuarioTermo]);

  // Buscar sugestões Obras
  useEffect(() => {
    if (obraTermo.length === 0) {
      setObraSugestoes([]);
      setObraIdSelecionada("");
      return;
    }
    api.get(`/obras?search=${encodeURIComponent(obraTermo)}`)
      .then(res => setObraSugestoes(res.data))
      .catch(() => setObraSugestoes([]));
  }, [obraTermo]);

  // Buscar sugestões Locais
  useEffect(() => {
    if (localTermo.length === 0) {
      setLocalSugestoes([]);
      setLocalIdSelecionado("");
      return;
    }
    api.get(`/locais?search=${encodeURIComponent(localTermo)}`)
      .then(res => setLocalSugestoes(res.data))
      .catch(() => setLocalSugestoes([]));
  }, [localTermo]);

  // Selecionar usuário
  const handleSelecionarUsuario = (usuario) => {
    setUsuarioTermo(usuario.nome);
    setUsuarioIdSelecionado(usuario.id);
    setUsuarioSugestoes([]);
  };

  // Selecionar obra
  const handleSelecionarObra = (obra) => {
    const texto = `${obra.titulo} - ${obra.autoria || "Desconhecida"}`;
    setObraTermo(texto);
    setObraIdSelecionada(obra.id);
    setObraSugestoes([]);
  };

  // Selecionar local
  const handleSelecionarLocal = (local) => {
    setLocalTermo(local.nome);
    setLocalIdSelecionado(local.id);
    setLocalSugestoes([]);
  };

  // Buscar movimentações
  const buscarMovimentacoes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};

      if (usuarioIdSelecionado) params.usuario_id = usuarioIdSelecionado;
      if (obraIdSelecionada) params.obra_id = obraIdSelecionada;
      if (localIdSelecionado) params.local_id = localIdSelecionado;
      if (tipoMovimentacao) params.tipo_movimentacao = tipoMovimentacao.trim();
      if (dataInicio) params.data_inicio = dataInicio;
      if (dataFim) params.data_fim = dataFim;

      console.log("Enviando filtros:", params);

      const res = await api.get("/movimentacoes", { params });

      setMovimentacoes(res.data);

      if (res.data.length === 0) {
        setError("Nenhuma movimentação encontrada com os filtros aplicados.");
      }
    } catch (err) {
      console.error("Erro ao buscar movimentações:", err);
      setError("Erro ao carregar dados. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Limpar filtros
  const handleLimpar = () => {
    setUsuarioTermo("");
    setUsuarioIdSelecionado("");
    setUsuarioSugestoes([]);

    setObraTermo("");
    setObraIdSelecionada("");
    setObraSugestoes([]);

    setLocalTermo("");
    setLocalIdSelecionado("");
    setLocalSugestoes([]);

    setTipoMovimentacao("");
    setDataInicio("");
    setDataFim("");
    setMovimentacoes([]);
    setError(null);
  };

  // Exportar CSV
  const exportarCSV = () => {
    if (movimentacoes.length === 0) {
      alert("Nenhuma movimentação para exportar.");
      return;
    }

    const headers = [
      "ID", "Obra ID", "Local ID", "Obra Nome", "Local Nome", "Usuário Nome",
      "Tipo de Movimentação", "Data da Movimentação"
    ];

    const csvRows = [];
    csvRows.push(headers.join(","));

    movimentacoes.forEach(mov => {
      const row = [
        mov.id,
        mov.obra_id,
        mov.local_id,
        mov.obra_nome,
        mov.local_nome,
        mov.usuario_nome,
        mov.tipo_movimentacao,
        new Date(mov.data_movimentacao).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
      ];
      csvRows.push(row.join(","));
    });

    const csvData = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(csvData);
    const a = document.createElement("a");
    a.href = url;
    a.download = "movimentacoes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <h1>Consulta de Movimentações</h1>
      <p className="TextoNormal">
        Filtre as movimentações por <strong>Usuário</strong>, <strong>Obra (Nome, ID ou Autor)</strong>,{" "}
        <strong>Local (Nome ou ID)</strong>, <strong>Tipo de Movimentação</strong> e <strong>Data</strong>.
      </p>

      {/* Usuário autocomplete */}
      <div className="autocomplete-container" style={{ position: "relative" }}>
        <label>Nome do Usuário</label>
        <input
          type="text"
          value={usuarioTermo}
          onChange={e => {
            setUsuarioTermo(e.target.value);
            setUsuarioIdSelecionado("");
          }}
          placeholder="Digite o nome do usuário"
          autoComplete="off"
        />
        {usuarioSugestoes.length > 0 && (
          <ul className="autocomplete-list mostrar" style={{ maxHeight: 200, overflowY: "auto" }}>
            {usuarioSugestoes.map(usuario => (
              <li
                key={usuario.id}
                onClick={() => handleSelecionarUsuario(usuario)}
                style={{ cursor: "pointer" }}
              >
                {usuario.nome}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Obra autocomplete */}
      <div className="autocomplete-container" style={{ position: "relative" }}>
        <label>Obra (Nome, ID ou Autor)</label>
        <input
          type="text"
          value={obraTermo}
          onChange={e => {
            setObraTermo(e.target.value);
            setObraIdSelecionada("");
          }}
          placeholder="Digite nome, ID ou autor"
          autoComplete="off"
        />
        {obraSugestoes.length > 0 && (
          <ul className="autocomplete-list mostrar" style={{ maxHeight: 200, overflowY: "auto" }}>
            {obraSugestoes.map(obra => (
              <li
                key={obra.id}
                onClick={() => handleSelecionarObra(obra)}
                style={{ cursor: "pointer" }}
              >
                {obra.titulo} - {obra.autoria || "Desconhecida"}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Local autocomplete */}
      <div className="autocomplete-container" style={{ position: "relative" }}>
        <label>Local (Nome ou ID)</label>
        <input
          type="text"
          value={localTermo}
          onChange={e => {
            setLocalTermo(e.target.value);
            setLocalIdSelecionado("");
          }}
          placeholder="Digite nome ou ID do local"
          autoComplete="off"
        />
        {localSugestoes.length > 0 && (
          <ul className="autocomplete-list mostrar" style={{ maxHeight: 200, overflowY: "auto" }}>
            {localSugestoes.map(local => (
              <li
                key={local.id}
                onClick={() => handleSelecionarLocal(local)}
                style={{ cursor: "pointer" }}
              >
                {local.nome}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tipo de Movimentação */}
      <div className="autocomplete-container">
        <label>Tipo de Movimentação</label>
        <select
          value={tipoMovimentacao}
          onChange={e => setTipoMovimentacao(e.target.value)}
        >
          <option value="">Selecione...</option>
          <option value="Entrada">Entrada</option>
          <option value="Saída">Saída</option>
        </select>
      </div>

      {/* Data de Início */}
      <div className="autocomplete-container">
        <label>Data de Início</label>
        <input
          type="date"
          value={dataInicio}
          onChange={e => setDataInicio(e.target.value)}
        />
      </div>

      {/* Data de Fim */}
      <div className="autocomplete-container">
        <label>Data de Fim</label>
        <input
          type="date"
          value={dataFim}
          onChange={e => setDataFim(e.target.value)}
        />
      </div>

      {/* Botões */}
      <button onClick={buscarMovimentacoes} style={{ marginTop: 20 }}>
        {loading ? "Carregando..." : "Buscar Movimentações"}
      </button>

      <button onClick={handleLimpar} style={{ marginTop: 20 }}>
        Limpar Filtros
      </button>

      <button onClick={exportarCSV} style={{ marginTop: 20 }}>
        Exportar para CSV
      </button>

      {/* Mensagem de erro */}
      {error && <p style={{ color: "red", marginTop: 20 }}>{error}</p>}

      {/* Resultado */}
      <div style={{ marginTop: 20 }}>
        {movimentacoes.length > 0 ? (
          <ul className="movimentacoes-lista">
            {movimentacoes.map((mov, i) => (
              <li key={i} className="mov-card">
                <div>
                  <span className="tipo">{mov.tipo_movimentacao}</span>{" "}
                  <span className="data">
                    {new Date(mov.data_movimentacao).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div>
                  <strong>Usuário:</strong> {mov.usuario_nome}
                  <br />
                  <strong>Nome da Obra:</strong> {mov.obra_nome}
                  <br />
                  <strong>Autoria:</strong> {mov.autoria || "Desconhecida"}
                  <br />
                  <strong>Local:</strong> {mov.local_nome}
                  {mov.observacao && (
                    <>
                      <br />
                      <strong>Observação:</strong> {mov.observacao}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : !error && !loading ? (
          <p>Nenhum filtro aplicado ainda.</p>
        ) : null}
      </div>
    </div>
  );
}
