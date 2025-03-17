import React, { useEffect, useState } from "react";
import api, { registrarMovimentacao } from "../services/api";  // api e a função registrarMovimentacao
import "../index.css";

export default function Movimentacao() {
    const [obras, setObras] = useState([]);
    const [locais, setLocais] = useState([]);

    // Textos digitados nos inputs
    const [obraSelecionada, setObraSelecionada] = useState("");
    const [obraId, setObraId] = useState(null);
    const [localSelecionado, setLocalSelecionado] = useState("");
    const [localId, setLocalId] = useState(null);

    // Exibir mensagem de sucesso ou erro
    const [mensagem, setMensagem] = useState("");

    // Arrays filtrados para autocomplete
    const [filtrandoObras, setFiltrandoObras] = useState([]);
    const [filtrandoLocais, setFiltrandoLocais] = useState([]);

    //-----------------------------------------------------------------------
    // 3.1. Buscar obras e locais ao carregar a página (useEffect inicial)
    //-----------------------------------------------------------------------
    useEffect(() => {
      // Pega a lista de obras
      api.get("/obras")
          .then((res) => {
              console.log("Obras recebidas da API:", res.data);
              setObras(res.data);
          })
          .catch((err) => console.error("Erro ao buscar obras:", err));
  
      // Pega a lista de locais
      api.get("/locais")
          .then((res) => {
              console.log("Locais recebidos da API:", res.data);
              setLocais(res.data);
          })
          .catch((err) => console.error("Erro ao buscar locais:", err));
    }, []); 
    // O array vazio [] faz com que isso seja executado só uma vez (quando o componente monta).

    //-----------------------------------------------------------------------
    // 3.2. Exibir no console as obras e locais (apenas debug)
    //-----------------------------------------------------------------------
    useEffect(() => {
        console.log("Obras carregadas:", obras);
        console.log("Locais carregados:", locais);
    }, [obras, locais]);

    //-----------------------------------------------------------------------
    // 3.3. Filtrar obras (função chamada ao digitar no input de obras)
    //-----------------------------------------------------------------------
    const handleFiltrarObras = (termo) => {
      console.log("Obras atuais no estado:", obras);
      setObraSelecionada(termo);

      if (termo.length > 0 && obras.length > 0) {
          // Filtra obras cujo título inclua o termo digitado
          const filtradas = obras.filter((obra) =>
              obra.titulo.toLowerCase().includes(termo.toLowerCase())
          );
          console.log("Obras filtradas:", filtradas);
          setFiltrandoObras(filtradas);
      } else {
          setFiltrandoObras([]);
      }
    };
  
    //-----------------------------------------------------------------------
    // 3.4. Filtrar locais (função chamada ao digitar no input de locais)
    //-----------------------------------------------------------------------
    const handleFiltrarLocais = (termo) => {
        console.log("Locais atuais no estado:", locais);
        setLocalSelecionado(termo);

        if (termo.length > 0 && locais.length > 0) {
            const filtrados = locais.filter((local) =>
                local.nome.toLowerCase().includes(termo.toLowerCase())
            );
            console.log("Locais filtrados:", filtrados);
            setFiltrandoLocais(filtrados);
        } else {
            setFiltrandoLocais([]);
        }
    };

    //-----------------------------------------------------------------------
    // 3.5. Selecionar uma obra ao clicar numa opção da autocomplete
    //-----------------------------------------------------------------------
    const handleSelecionarObra = (obra) => {
      setObraSelecionada(obra.titulo);  // mostra o título no input
      setObraId(obra.id);              // guarda o ID para posterior POST
      setFiltrandoObras([]);           // some com a lista
      document.getElementById("obraInput").blur(); // remove foco do input
    };

    //-----------------------------------------------------------------------
    // 3.6. Selecionar um local ao clicar numa opção da autocomplete
    //-----------------------------------------------------------------------
    const handleSelecionarLocal = (local) => {
      setLocalSelecionado(local.nome);
      setLocalId(local.id);
      setFiltrandoLocais([]);
      document.getElementById("localInput").blur();
    };

    //-----------------------------------------------------------------------
    // 3.7. Registrar a movimentação (chamado ao clicar no botão "Registrar")
    //-----------------------------------------------------------------------
    const handleRegistrar = async () => {
      // Verifica se de fato temos obraId e localId selecionados
      if (!obraId || !localId) {
          setMensagem("Selecione uma obra e um local!");
          return;
      }
  
      console.log("Enviando movimentação:", { obra_id: obraId, local_id: localId });
  
      try {
          // Chama a função do api.js, que faz POST /movimentacoes
          await registrarMovimentacao(obraId, localId);
          setMensagem("Movimentação registrada com sucesso!");

          // Limpa os campos
          setObraSelecionada("");
          setObraId(null);
          setLocalSelecionado("");
          setLocalId(null);
      } catch (error) {
          console.error("Erro ao registrar movimentação:", error);
          setMensagem("Erro ao registrar movimentação.");
      }
    };  

    //-----------------------------------------------------------------------
    // 3.8. Effects para atualizar a lista de filtragem conforme digitação
    //-----------------------------------------------------------------------
    useEffect(() => {
        if (obraSelecionada.length > 0 && obras.length > 0 && obraId === null) {
            const filtradas = obras.filter((obra) =>
                obra.titulo.toLowerCase().includes(obraSelecionada.toLowerCase())
            );
            setFiltrandoObras(filtradas);
        } else {
            setFiltrandoObras([]);
        }
    }, [obraSelecionada, obras, obraId]);
    
  
    useEffect(() => {
        if (localSelecionado.length > 0 && locais.length > 0 && localId === null) {
            const filtrados = locais.filter((local) =>
                local.nome.toLowerCase().includes(localSelecionado.toLowerCase())
            );
            setFiltrandoLocais(filtrados);
        } else {
            setFiltrandoLocais([]);
        }
    }, [localSelecionado, locais, localId]);
  
    //-----------------------------------------------------------------------
    // 3.9. Renderização do componente: Inputs, listagens de autocomplete, botão
    //-----------------------------------------------------------------------
    return (
      <div className="container">
          <h1>Movimentação de Obras</h1>

          {/* Campo de busca para obras */}
          <div className="autocomplete-container">
            <input
                id="obraInput"
                type="text"
                placeholder="Digite o nome da obra"
                value={obraSelecionada}
                onChange={(e) => handleFiltrarObras(e.target.value)}
            />
            
            {/* Botão "X" para limpar a pesquisa */}
            {obraSelecionada && (
                <span className="clear-btn" onClick={() => setObraSelecionada("")}>×</span>
            )}

            {/* Lista de autocomplete de obras */}
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

          {/* Campo de busca para locais */}
          <div className="autocomplete-container">
            <input
                id="localInput"
                type="text"
                placeholder="Digite o local de armazenamento"
                value={localSelecionado}
                onChange={(e) => handleFiltrarLocais(e.target.value)}
            />
            
            {/* Botão "X" para limpar a pesquisa */}
            {localSelecionado && (
                <span className="clear-btn" onClick={() => setLocalSelecionado("")}>×</span>
            )}

            {/* Lista de autocomplete de locais */}
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

          {/* Botão para registrar movimentação */}
          <button onClick={handleRegistrar}>Registrar</button>
  
          {/* Mensagem de sucesso ou erro */}
          {mensagem && <p className="mensagem">{mensagem}</p>}
      </div>
    );
}
