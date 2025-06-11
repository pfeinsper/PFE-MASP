import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../index.css";

export default function Consulta() {
  const [usuarioTermo, setUsuarioTermo] = useState("");
  const [usuarioIdSelecionado, setUsuarioIdSelecionado] = useState("");
  const [usuarioNomeSelecionado, setUsuarioNomeSelecionado] = useState("");
  const [usuarioSugestoes, setUsuarioSugestoes] = useState([]);
  const [showUsuarioSugestoes, setShowUsuarioSugestoes] = useState(false);

  const [obraTermo, setObraTermo] = useState("");
  const [obraIdSelecionada, setObraIdSelecionada] = useState("");
  const [obraSugestoes, setObraSugestoes] = useState([]);
  const [showObraSugestoes, setShowObraSugestoes] = useState(false);

  const [localTermo, setLocalTermo] = useState("");
  const [localIdSelecionado, setLocalIdSelecionado] = useState("");
  const [localSugestoes, setLocalSugestoes] = useState([]);
  const [showLocalSugestoes, setShowLocalSugestoes] = useState(false);

  const [tipoMovimentacao, setTipoMovimentacao] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (usuarioTermo.trim().length === 0) {
      setUsuarioSugestoes([]);
      return;
    }
    const delay = setTimeout(() => {
      api.get(`/usuarios?search=${encodeURIComponent(usuarioTermo)}`)
        .then(res => setUsuarioSugestoes(res.data))
        .catch(() => setUsuarioSugestoes([]));
    }, 300);
    return () => clearTimeout(delay);
  }, [usuarioTermo]);

  useEffect(() => {
    if (obraTermo.trim().length < 4) {
      setObraSugestoes([]);
      return;
    }
    const delay = setTimeout(() => {
      api.get(`/obras?search=${encodeURIComponent(obraTermo)}`)
        .then(res => setObraSugestoes(res.data))
        .catch(() => setObraSugestoes([]));
    }, 500);
    return () => clearTimeout(delay);
  }, [obraTermo]);

  useEffect(() => {
    if (localTermo.trim().length === 0) {
      setLocalSugestoes([]);
      return;
    }
    const delay = setTimeout(() => {
      api.get(`/locais?search=${encodeURIComponent(localTermo)}`)
        .then(res => setLocalSugestoes(res.data))
        .catch(() => setLocalSugestoes([]));
    }, 300);
    return () => clearTimeout(delay);
  }, [localTermo]);

  const handleSelecionarUsuario = (usuario) => {
    setUsuarioTermo(usuario.nome);
    setUsuarioIdSelecionado(usuario.id);
    setUsuarioNomeSelecionado(usuario.nome);
    setUsuarioSugestoes([]);
    setShowUsuarioSugestoes(false);
  };

  const handleSelecionarObra = (obra) => {
    setObraTermo(obra.id);
    setObraIdSelecionada(obra.id);
    setObraSugestoes([]);
    setShowObraSugestoes(false);
  };

  const handleSelecionarLocal = (local) => {
    setLocalTermo(local.nome);
    setLocalIdSelecionado(local.id);
    setLocalSugestoes([]);
    setShowLocalSugestoes(false);
  };

  const buscarMovimentacoes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};

      if (usuarioTermo.trim()) {
        params.usuario_nome = usuarioNomeSelecionado || usuarioTermo.trim();
      }
      if (obraIdSelecionada) {
        params.obra_id = obraIdSelecionada;
      } else if (obraTermo.trim()) {
        params.obra_id = obraTermo.trim();
      }
      if (localIdSelecionado) {
        params.local_id = localIdSelecionado;
      } else if (localTermo.trim()) {
        params.local_nome = localTermo.trim();
      }
      if (tipoMovimentacao) params.tipo_movimentacao = tipoMovimentacao;
      if (dataInicio) params.data_inicio = dataInicio;
      if (dataFim) params.data_fim = dataFim;

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

  const handleLimpar = () => {
    setUsuarioTermo("");
    setUsuarioIdSelecionado("");
    setUsuarioNomeSelecionado("");
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

  const exportarCSV = () => {
    if (movimentacoes.length === 0) {
      alert("Nenhuma movimentação para exportar.");
      return;
    }

    const headers = [
      "ID", "Obra ID", "Local ID", "Obra Nome", "Local Nome", "Usuário Nome",
      "Tipo de Movimentação", "Data da Movimentação"
    ];
    const csvRows = [headers.join(",")];

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

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "movimentacoes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <h1>Consulta de Movimentações</h1>

      {/* Usuário */}
      <div className="autocomplete-container" style={{ position: "relative" }}>
        <label>Nome do Usuário</label>
        <input
          type="text"
          value={usuarioTermo}
          onChange={(e) => {
            setUsuarioTermo(e.target.value);
            setShowUsuarioSugestoes(true);
          }}
          onFocus={() => setShowUsuarioSugestoes(true)}
          onBlur={() => setTimeout(() => setShowUsuarioSugestoes(false), 150)}
          placeholder="Digite o nome do usuário"
        />
        {usuarioTermo && (
          <span className="clear-btn" onClick={() => {
            setUsuarioTermo("");
            setUsuarioIdSelecionado("");
            setUsuarioSugestoes([]);
          }}>×</span>
        )}
        {showUsuarioSugestoes && usuarioSugestoes.length > 0 && (
          <ul className="autocomplete-list mostrar">
            {usuarioSugestoes.map(usuario => (
              <li key={usuario.id} onClick={() => handleSelecionarUsuario(usuario)}>
                {usuario.nome}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Obra */}
      <div className="autocomplete-container" style={{ position: "relative" }}>
        <label>Obra (Número de Tombo)</label>
        <input
          type="text"
          value={obraTermo}
          onChange={(e) => {
            setObraTermo(e.target.value);
            setShowObraSugestoes(true);
          }}
          onFocus={() => setShowObraSugestoes(true)}
          onBlur={() => setTimeout(() => setShowObraSugestoes(false), 150)}
          placeholder="Digite o número de tombo"
        />
        {obraTermo && (
          <span className="clear-btn" onClick={() => {
            setObraTermo("");
            setObraIdSelecionada("");
            setObraSugestoes([]);
          }}>×</span>
        )}
        {showObraSugestoes && obraSugestoes.length > 0 && (
          <ul className="autocomplete-list mostrar">
            {obraSugestoes.map(obra => (
              <li key={obra.id} onClick={() => handleSelecionarObra(obra)}>
                {obra.id} - {obra.titulo}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Local */}
      <div className="autocomplete-container" style={{ position: "relative" }}>
        <label>Local (ID ou nome)</label>
        <input
          type="text"
          value={localTermo}
          onChange={(e) => {
            setLocalTermo(e.target.value);
            setShowLocalSugestoes(true);
          }}
          onFocus={() => setShowLocalSugestoes(true)}
          onBlur={() => setTimeout(() => setShowLocalSugestoes(false), 150)}
          placeholder="Digite o nome do local"
        />
        {localTermo && (
          <span className="clear-btn" onClick={() => {
            setLocalTermo("");
            setLocalIdSelecionado("");
            setLocalSugestoes([]);
          }}>×</span>
        )}
        {showLocalSugestoes && localSugestoes.length > 0 && (
          <ul className="autocomplete-list mostrar">
            {localSugestoes.map(local => (
              <li key={local.id} onClick={() => handleSelecionarLocal(local)}>
                {local.nome}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tipo e datas */}
      <div className="autocomplete-container">
        <label>Tipo de Movimentação</label>
        <select value={tipoMovimentacao} onChange={e => setTipoMovimentacao(e.target.value)}>
          <option value="">Selecione...</option>
          <option value="Entrada">Entrada</option>
          <option value="Saída">Saída</option>
        </select>
      </div>

      <div className="autocomplete-container">
        <label>Data de Início</label>
        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
      </div>

      <div className="autocomplete-container">
        <label>Data de Fim</label>
        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
      </div>

      <button onClick={buscarMovimentacoes} style={{ marginTop: 20 }}>
        {loading ? "Carregando..." : "Buscar Movimentações"}
      </button>
      <button onClick={handleLimpar} style={{ marginTop: 20 }}>Limpar Filtros</button>
      <button onClick={exportarCSV} style={{ marginTop: 20 }}>Exportar para CSV</button>

      {error && <p style={{ color: "red", marginTop: 20 }}>{error}</p>}

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
                  <strong>Obra:</strong> {mov.obra_nome}
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
