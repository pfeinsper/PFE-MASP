import React, { useEffect, useState } from "react";
import api, { registrarMovimentacao } from "../services/api";
import "../index.css";

export default function Movimentacao() {
  // Estados para obras, locais, usuários
  const [obras, setObras] = useState([]);
  const [locais, setLocais] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Estados para guardar o que o usuário digita + IDs selecionados
  const [obraSelecionada, setObraSelecionada] = useState("");
  const [obraId, setObraId] = useState(null);

  const [localSelecionado, setLocalSelecionado] = useState("");
  const [localId, setLocalId] = useState(null);

  // Autocomplete de usuário
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);

  // Agora: tipo de movimentação será um <select> simples
  const [tipoSelecionado, setTipoSelecionado] = useState("");

  // Mensagem de feedback
  const [mensagem, setMensagem] = useState("");

  // Arrays filtrados para autocomplete
  const [filtrandoObras, setFiltrandoObras] = useState([]);
  const [filtrandoLocais, setFiltrandoLocais] = useState([]);
  const [filtrandoUsuarios, setFiltrandoUsuarios] = useState([]);

  //-----------------------------------------------------------------------
  // Buscar obras, locais, USUÁRIOS ao carregar a página
  //-----------------------------------------------------------------------
  useEffect(() => {
    // 1. Pegar a lista de obras
    api.get("/obras")
      .then((res) => {
        console.log("Obras recebidas:", res.data);
        setObras(res.data);
      })
      .catch((err) => console.error("Erro ao buscar obras:", err));
    
    // 2. Pegar a lista de locais
    api.get("/locais")
      .then((res) => {
        console.log("Locais recebidos:", res.data);
        setLocais(res.data);
      })
      .catch((err) => console.error("Erro ao buscar locais:", err));

    // 3. Pegar a lista de usuários
    api.get("/usuarios")
      .then((res) => {
        console.log("Usuários recebidos:", res.data);
        setUsuarios(res.data);
      })
      .catch((err) => console.error("Erro ao buscar usuários:", err));
  }, []);

  //-----------------------------------------------------------------------
  // Filtragem para autocomplete (obras, locais, usuários)
  //-----------------------------------------------------------------------
  const handleFiltrarObras = (termo) => {
    setObraSelecionada(termo);
    if (termo.length > 0 && obras.length > 0) {
      const filtradas = obras.filter((obra) =>
        obra.titulo.toLowerCase().includes(termo.toLowerCase())
      );
      setFiltrandoObras(filtradas);
    } else {
      setFiltrandoObras([]);
    }
  };

  const handleFiltrarLocais = (termo) => {
    setLocalSelecionado(termo);
    if (termo.length > 0 && locais.length > 0) {
      const filtrados = locais.filter((local) =>
        local.nome.toLowerCase().includes(termo.toLowerCase())
      );
      setFiltrandoLocais(filtrados);
    } else {
      setFiltrandoLocais([]);
    }
  };

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

  //-----------------------------------------------------------------------
  // Seleção (quando clica numa sugestão no autocomplete)
  //-----------------------------------------------------------------------
  const handleSelecionarObra = (obra) => {
    setObraSelecionada(obra.titulo);
    setObraId(obra.id);
    setFiltrandoObras([]);
    document.getElementById("obraInput")?.blur();
  };

  const handleSelecionarLocal = (local) => {
    setLocalSelecionado(local.nome);
    setLocalId(local.id);
    setFiltrandoLocais([]);
    document.getElementById("localInput")?.blur();
  };

  const handleSelecionarUsuario = (user) => {
    setUsuarioSelecionado(user.nome);
    setUsuarioId(user.id);
    setFiltrandoUsuarios([]);
    document.getElementById("usuarioInput")?.blur();
  };

  //-----------------------------------------------------------------------
  // Registrar Movimentação
  //-----------------------------------------------------------------------
  const handleRegistrar = async () => {
    // Validação
    if (!obraId || !localId) {
      setMensagem("Selecione uma obra e um local!");
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

    // Monta objeto
    const payload = {
      obra_id: obraId,
      local_id: localId,
      usuario_id: usuarioId,
      tipo_movimentacao: tipoSelecionado
    };
    console.log("Enviando movimentação:", payload);

    try {
      await registrarMovimentacao(obraId, localId, usuarioId, tipoSelecionado);
      setMensagem("Movimentação registrada com sucesso!");

      // Limpa campos
      setObraSelecionada("");
      setObraId(null);
      setLocalSelecionado("");
      setLocalId(null);
      setUsuarioSelecionado("");
      setUsuarioId(null);
      setTipoSelecionado("");
    } catch (error) {
      console.error("Erro ao registrar movimentação:", error);
      setMensagem("Erro ao registrar movimentação.");
    }
  };

  //-----------------------------------------------------------------------
  // Renderização do componente
  //-----------------------------------------------------------------------
  return (
    <div className="container">
      <h1>Movimentação de Obras</h1>

      {/* Campo de busca para usuários (autocomplete) */}
      <div className="autocomplete-container">
        <input
          id="usuarioInput"
          type="text"
          placeholder="Digite o nome do usuário"
          value={usuarioSelecionado}
          onChange={(e) => {
            setUsuarioId(null);
            handleFiltrarUsuarios(e.target.value);
          }}
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
            {filtrandoUsuarios.map((user) => (
              <li key={user.id} onClick={() => handleSelecionarUsuario(user)}>
                {user.nome}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Campo de busca para obras (autocomplete) */}
      <div className="autocomplete-container">
        <input
          id="obraInput"
          type="text"
          placeholder="Digite o nome da obra"
          value={obraSelecionada}
          onChange={(e) => {
            setObraId(null);
            handleFiltrarObras(e.target.value);
          }}
        />
        {obraSelecionada && (
          <span
            className="clear-btn"
            onClick={() => {
              setObraSelecionada("");
              setObraId(null);
            }}
          >
            ×
          </span>
        )}

        {filtrandoObras.length > 0 && (
          <ul className="autocomplete-list mostrar">
            {filtrandoObras.map((obra) => (
              <li key={obra.id} onClick={() => handleSelecionarObra(obra)}>
                {obra.titulo}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Campo de busca para locais (autocomplete) */}
      <div className="autocomplete-container">
        <input
          id="localInput"
          type="text"
          placeholder="Digite o local de armazenamento"
          value={localSelecionado}
          onChange={(e) => {
            setLocalId(null);
            handleFiltrarLocais(e.target.value);
          }}
        />
        {localSelecionado && (
          <span
            className="clear-btn"
            onClick={() => {
              setLocalSelecionado("");
              setLocalId(null);
            }}
          >
            ×
          </span>
        )}

        {filtrandoLocais.length > 0 && (
          <ul className="autocomplete-list mostrar">
            {filtrandoLocais.map((local) => (
              <li key={local.id} onClick={() => handleSelecionarLocal(local)}>
                {local.nome}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Select para tipo de movimentação */}
      <div className="select-container">
        <select
            id="tipoMovimentacao"
            value={tipoSelecionado}
            onChange={(e) => setTipoSelecionado(e.target.value)}
            required
        >
            <option value="" disabled hidden>Selecione a movimentação</option>
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
        </select>
    </div>



      {/* Botão para registrar movimentação */}
      <button onClick={handleRegistrar}>Registrar</button>

      {/* Mensagem de sucesso ou erro */}
      {mensagem && <p className="mensagem">{mensagem}</p>}
    </div>
  );
}
