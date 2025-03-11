import React, { useEffect, useState } from "react";
import api, { registrarMovimentacao } from "../services/api";
import "../index.css";

export default function Movimentacao() {
    const [obras, setObras] = useState([]);
    const [locais, setLocais] = useState([]);
    const [obraSelecionada, setObraSelecionada] = useState("");
    const [obraId, setObraId] = useState(null);
    const [localSelecionado, setLocalSelecionado] = useState("");
    const [localId, setLocalId] = useState(null);
    const [mensagem, setMensagem] = useState("");
    const [filtrandoObras, setFiltrandoObras] = useState([]);
    const [filtrandoLocais, setFiltrandoLocais] = useState([]);

    // Buscar obras e locais ao carregar a página
    useEffect(() => {
      api.get("/obras")
          .then((res) => {
              console.log("Obras recebidas da API:", res.data); // Verifica se os dados estão corretos
              setObras(res.data);
          })
          .catch((err) => console.error("Erro ao buscar obras:", err));
  
      api.get("/locais")
          .then((res) => {
              console.log("Locais recebidos da API:", res.data); // Verifica se os dados estão corretos
              setLocais(res.data);
          })
          .catch((err) => console.error("Erro ao buscar locais:", err));
    }, []); 
  

    // Exibir os dados carregados no console para depuração
    useEffect(() => {
        console.log("Obras carregadas:", obras);
        console.log("Locais carregados:", locais);
    }, [obras, locais]);

    const handleFiltrarObras = (termo) => {
      console.log("Obras atuais no estado:", obras); // Verifica se os dados estão carregados antes da filtragem
      setObraSelecionada(termo);
      if (termo.length > 0 && obras.length > 0) {  // Verifica se o array de obras está populado
          const filtradas = obras.filter((obra) =>
              obra.titulo.toLowerCase().includes(termo.toLowerCase())
          );
          console.log("Obras filtradas:", filtradas);
          setFiltrandoObras(filtradas);
      } else {
          setFiltrandoObras([]);
      }
  };
  
    const handleFiltrarLocais = (termo) => {
        console.log("Locais atuais no estado:", locais); // Verifica se os dados estão carregados antes da filtragem
        setLocalSelecionado(termo);
        if (termo.length > 0 && locais.length > 0) { // Verifica se o array de locais está populado
            const filtrados = locais.filter((local) =>
                local.nome.toLowerCase().includes(termo.toLowerCase())
            );
            console.log("Locais filtrados:", filtrados);
            setFiltrandoLocais(filtrados);
        } else {
            setFiltrandoLocais([]);
        }
    };
  

    // Selecionar uma obra ao clicar
    const handleSelecionarObra = (obra) => {
        setObraSelecionada(obra.titulo);
        setObraId(obra.id);
        setFiltrandoObras([]);
    };

    // Selecionar um local ao clicar
    const handleSelecionarLocal = (local) => {
        setLocalSelecionado(local.nome);
        setLocalId(local.id);
        setFiltrandoLocais([]);
    };

    // Função para registrar a movimentação
    const handleRegistrar = async () => {
        if (!obraId || !localId) {
            setMensagem("Selecione uma obra e um local!");
            return;
        }

        try {
            await registrarMovimentacao(obraId, localId);
            setMensagem("Movimentação registrada com sucesso!");
            setObraSelecionada("");
            setObraId(null);
            setLocalSelecionado("");
            setLocalId(null);
        } catch (error) {
            setMensagem("Erro ao registrar movimentação.");
        }
    };

    useEffect(() => {
      if (obraSelecionada.length > 0 && obras.length > 0) {
          const filtradas = obras.filter((obra) =>
              obra.titulo.toLowerCase().includes(obraSelecionada.toLowerCase())
          );
          setFiltrandoObras(filtradas);
      } else {
          setFiltrandoObras([]);
      }
    }, [obraSelecionada, obras]);
  
    useEffect(() => {
      if (localSelecionado.length > 0 && locais.length > 0) {
          const filtrados = locais.filter((local) =>
              local.nome.toLowerCase().includes(localSelecionado.toLowerCase())
          );
          setFiltrandoLocais(filtrados);
      } else {
          setFiltrandoLocais([]);
      }
    }, [localSelecionado, locais]);
  

    return (
      <div className="container">
          <h1>Movimentação de Obras</h1>
  
          {/* Campo de busca para obras */}
          <div className="autocomplete-container">
              <input
                  type="text"
                  placeholder="Digite o nome da obra"
                  value={obraSelecionada}
                  onChange={(e) => handleFiltrarObras(e.target.value)}
              />
              {filtrandoObras.length > 0 && (
                  <ul className={`autocomplete-list ${filtrandoObras.length > 0 ? "mostrar" : ""}`}>
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
                  type="text"
                  placeholder="Digite o local de armazenamento"
                  value={localSelecionado}
                  onChange={(e) => handleFiltrarLocais(e.target.value)}
              />
              {filtrandoLocais.length > 0 && (
                  <ul className={`autocomplete-list ${filtrandoLocais.length > 0 ? "mostrar" : ""}`}>
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
