import React, { useState } from "react";
import "../index.css"; // Importando os estilos globais

export default function Movimentacao() {
  const [obraId, setObraId] = useState("");
  const [localizacao, setLocalizacao] = useState("");

  const registrarMovimentacao = () => {
    console.log(`Obra ${obraId} movida para ${localizacao}`);
  };

  return (
    <div className="container">
      <h1>Movimentação de Obras</h1>

      {/* Campos de entrada para ID da obra e nova localização */}
      <input
        type="text"
        placeholder="ID da Obra"
        value={obraId}
        onChange={(e) => setObraId(e.target.value)}
      />

      <input
        type="text"
        placeholder="Nova Localização"
        value={localizacao}
        onChange={(e) => setLocalizacao(e.target.value)}
      />

      {/* Botão de registro */}
      <button onClick={registrarMovimentacao}>Registrar</button>
    </div>
  );
}
