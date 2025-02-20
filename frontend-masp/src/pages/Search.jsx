import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css"; // Importando os estilos globais

// Dados de exemplo para simular a pesquisa (substituir pela API real no futuro)
const mockObras = [
  { id: "1", title: "Obra Teste 1", inventory_number: "001" },
  { id: "2", title: "Obra Teste 2", inventory_number: "002" },
  { id: "3", title: "Obra Teste 3", inventory_number: "003" },
];

export default function Search() {
  const [termo, setTermo] = useState("");
  const [obras, setObras] = useState([]);
  const navigate = useNavigate(); // Hook para navegação

  const buscarObras = () => {
    // Simula uma pesquisa local baseada no termo digitado
    const resultados = mockObras.filter((obra) =>
      obra.title.toLowerCase().includes(termo.toLowerCase())
    );
    setObras(resultados);
  };

  return (
    <div className="container">
      <h1>Pesquisar Obras</h1>
      
      {/* Campo de entrada para pesquisa */}
      <input
        type="text"
        placeholder="Digite o nome da obra"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
      />
      
      {/* Botão de busca */}
      <button onClick={buscarObras}>Buscar</button>
      
      {/* Lista de resultados */}
      <ul>
        {obras.map((obra) => (
          <li key={obra.id}>{obra.title} - {obra.inventory_number}</li>
        ))}
      </ul>

      {/* Botão para ir para a página de movimentação */}
      <button onClick={() => navigate("/movimentacao")}>Ir para Movimentação</button>
    </div>
  );
}
