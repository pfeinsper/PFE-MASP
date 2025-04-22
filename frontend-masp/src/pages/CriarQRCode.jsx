import React, { useState } from "react";
import QRCode from "qrcode";
import api from "../services/api";

export default function CriarQRCodeManual() {
  const [codigo, setCodigo] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [nome, setNome] = useState(""); // Armazena o nome da obra/local
  const [mensagem, setMensagem] = useState(""); // Feedback de erro ou aviso

  // Função para descobrir se "codigo" é inteiro ou texto
  // e buscar do backend
  const buscarNome = async (codigoDigitado) => {
    // Tenta parsear como inteiro
    const numero = parseInt(codigoDigitado, 10);

    // Se não for NaN e for > 0, supomos que é "local"
    // (ajuste se quiser aceitar 0 ou IDs negativos)
    if (!isNaN(numero) && numero > 0) {
      try {
        const res = await api.get(`/locais/codigo/${numero}`); 
        return res.data.nome;  // "nome" do local
      } catch (err) {
        console.error("Erro ao buscar local:", err);
        throw new Error("Local não encontrado.");
      }
    } else {
      // Caso contrário, tratamos como obra
      try {
        const res = await api.get(`/obras/codigo/${codigoDigitado}`);
        return res.data.titulo; // "titulo" da obra
      } catch (err) {
        console.error("Erro ao buscar obra:", err);
        throw new Error("Obra não encontrada.");
      }
    }
  };

  // Gera o QR code e também faz a busca do nome
  const handleGerarQR = async () => {
    if (!codigo.trim()) return;
    setMensagem("");
    setQrDataUrl("");
    setNome("");

    try {
      // 1. Busca nome (obra ou local)
      const nomeEncontrado = await buscarNome(codigo.trim());
      setNome(nomeEncontrado);

      // 2. Gera QR Code a partir do "codigo"
      const url = await QRCode.toDataURL(codigo.trim());
      setQrDataUrl(url);

    } catch (err) {
      setMensagem(err.message || "Erro ao buscar nome no servidor.");
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qrcode_${codigo}.png`;
    a.click();
  };

  return (
    <div className="container">
      <h1>Gerar QR Code</h1>
      <p className="TextoNormal">Digite o <strong>ID da obra</strong> ou <strong>ID do local</strong> para gerar o QR Code.</p>

      <input
        type="text"
        className="fullWidthInput"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Ex: MASP.00610 ou 3013"
      />
      <br />
      <button onClick={handleGerarQR}>Gerar QR Code</button>

      {/* Exibe mensagem de erro se houver */}
      {mensagem && <p style={{ color: "red" }}>{mensagem}</p>}

      {qrDataUrl && (
        <div style={{ marginTop: "30px" }}>
          <h3>Resultado para: <em>{codigo}</em></h3>

          {/* Exibe nome de local ou obra */}
          {nome && <p>Identificado: <strong>{nome}</strong></p>}

          <img src={qrDataUrl} alt="QR Code" style={{ maxWidth: "200px" }} />
          <br />
          <button onClick={handleDownload}>Baixar</button>
          <button onClick={() => window.print()}>Imprimir</button>
        </div>
      )}
    </div>
  );
}
