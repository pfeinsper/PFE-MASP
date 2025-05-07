import React, { useState } from "react";
import QRCode from "qrcode";
import api from "../services/api";

export default function CriarQRCodeManual() {
  const [codigo, setCodigo] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [nome, setNome] = useState(""); // nome ou título
  const [textoQR, setTextoQR] = useState(""); // texto abaixo do QR
  const [mensagem, setMensagem] = useState("");

  const buscarNome = async (codigoDigitado) => {
    const numero = parseInt(codigoDigitado, 10);

    if (!isNaN(numero) && numero > 0) {
      try {
        const res = await api.get(`/locais/codigo/${numero}`);
        setTextoQR(res.data.codigo); // mostra o campo "codigo"
        return res.data.nome;
      } catch (err) {
        throw new Error("Local não encontrado.");
      }
    } else {
      try {
        const res = await api.get(`/obras/codigo/${codigoDigitado}`);
        setTextoQR(codigoDigitado); // mostra o ID da obra
        return res.data.titulo;
      } catch (err) {
        throw new Error("Obra não encontrada.");
      }
    }
  };

  const handleGerarQR = async () => {
    if (!codigo.trim()) return;
    setMensagem("");
    setQrDataUrl("");
    setNome("");
    setTextoQR("");

    try {
      const nomeEncontrado = await buscarNome(codigo.trim());
      setNome(nomeEncontrado);
      const url = await QRCode.toDataURL(codigo.trim());
      setQrDataUrl(url);
    } catch (err) {
      setMensagem(err.message || "Erro ao buscar nome no servidor.");
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl || !textoQR) return;
  
    const qrImage = new Image();
    qrImage.src = qrDataUrl;
  
    qrImage.onload = () => {
      const qrSize = 100; // tamanho fixo do QR Code
      const maxWidth = qrSize;
      const padding = 10;
      let fontSize = 24;
  
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
  
      // Testa o tamanho ideal da fonte
      ctx.font = `${fontSize}px Arial`;
      while (ctx.measureText(textoQR).width > maxWidth && fontSize > 8) {
        fontSize -= 1;
        ctx.font = `${fontSize}px Arial`;
      }
  
      const height = qrSize + padding + fontSize;
      canvas.width = qrSize;
      canvas.height = height;
  
      // Fundo
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      // QR Code
      ctx.drawImage(qrImage, 0, 0, qrSize, qrSize);
  
      // Texto abaixo
      ctx.fillStyle = "#000";
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(textoQR, qrSize / 2, qrSize + 2);
  
      // Baixar imagem
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `qrcode_${codigo}.png`;
      a.click();
    };
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

      {mensagem && <p style={{ color: "red" }}>{mensagem}</p>}

      {qrDataUrl && (
        <div style={{ marginTop: "30px" }}>
          <h3>Resultado para: <em>{codigo}</em></h3>
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
