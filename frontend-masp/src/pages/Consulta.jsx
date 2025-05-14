import React, { useState } from "react";
import api from "../services/api";
import "../index.css";

export default function Consulta() {
  // Campos dos filtros
  const [usuarioNome, setUsuarioNome] = useState("");
  const [localNome, setLocalNome] = useState("");
  const [obraId, setObraId] = useState("");
  const [localId, setLocalId] = useState("");
  const [tipoMovimentacao, setTipoMovimentacao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Resultados da busca
  const [movimentacoes, setMovimentacoes] = useState([]);

  // Carregando ou erro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função que monta e envia os filtros
  const buscarMovimentacoes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};

      if (usuarioNome) params.usuario_nome = usuarioNome.trim();
      if (localNome) params.local_nome = localNome.trim();
      if (obraId) params.obra_id = obraId.trim();
      if (localId) params.local_id = localId.trim();
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

  // Limpa todos os campos
  const handleLimpar = () => {
    setUsuarioNome("");
    setLocalNome("");
    setObraId("");
    setLocalId("");
    setTipoMovimentacao("");
    setDataInicio("");
    setDataFim("");
    setMovimentacoes([]);
    setError(null);
  };

  // Função para exportar movimentações para CSV
  const exportarCSV = () => {
    if (movimentacoes.length === 0) {
      alert("Nenhuma movimentação para exportar.");
      return;
    }

    const headers = [
      "ID", "Obra ID", "Local ID", "Obra Nome", "Local Nome", "Usuário Nome", 
      "Tipo de Movimentação", "Data da Movimentação"
    ];

    // Formata os dados para CSV
    const csvRows = [];
    csvRows.push(headers.join(",")); // Cabeçalho

    movimentacoes.forEach((mov) => {
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

    // Cria um arquivo CSV e faz o download
    const csvData = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(csvData);
    const a = document.createElement("a");
    a.href = url;
    a.download = "movimentacoes.csv";
    a.click();
    URL.revokeObjectURL(url); // Libera o URL
  };

  return (
    <div className="container">
      <h1>Consulta de Movimentações</h1>
      <p className="TextoNormal">
        Filtre as movimentações por <strong>data</strong>, <strong>usuário</strong>,{" "}
        <strong>local</strong>, <strong>ID da obra</strong>,{" "}
        <strong>ID do local</strong> e <strong>tipo de movimentação</strong>.
      </p>

      {/* Campos de filtro */}
      <div className="autocomplete-container">
        <label>Nome do Usuário</label>
        <input
          type="text"
          value={usuarioNome}
          onChange={(e) => setUsuarioNome(e.target.value)}
        />
      </div>

      <div className="autocomplete-container">
        <label>Nome do Local</label>
        <input
          type="text"
          value={localNome}
          onChange={(e) => setLocalNome(e.target.value)}
        />
      </div>

      <div className="autocomplete-container">
        <label>ID da Obra</label>
        <input
          type="text"
          value={obraId}
          onChange={(e) => setObraId(e.target.value)}
        />
      </div>

      <div className="autocomplete-container">
        <label>ID do Local</label>
        <input
          type="text"
          value={localId}
          onChange={(e) => setLocalId(e.target.value)}
        />
      </div>

      <div className="autocomplete-container">
        <label>Tipo de Movimentação</label>
        <input
          type="text"
          value={tipoMovimentacao}
          onChange={(e) => setTipoMovimentacao(e.target.value)}
        />
      </div>

      <div className="autocomplete-container">
        <label>Data de Início</label>
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
        />
      </div>

      <div className="autocomplete-container">
        <label>Data de Fim</label>
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
        />
      </div>

      {/* Botões */}
      <button onClick={buscarMovimentacoes} style={{ marginTop: 20 }}>
        {loading ? "Carregando..." : "Buscar Movimentações"}
      </button>

      <button onClick={handleLimpar} style={{ marginTop: 20 }}>
        Limpar Filtros
      </button>

      {/* Botão de Exportar para CSV */}
      <button onClick={exportarCSV} style={{ marginTop: 20 }}>
        Exportar para CSV
      </button>

      {/* Mensagem de erro ou sucesso */}
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
                  <strong>Local:</strong> {mov.local_nome}
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
