// src/pages/CriarQRCode.jsx
import React, { useState } from "react";
import QRCode from "qrcode";

export default function CriarQRCodeManual() {
  const [codigo, setCodigo] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  // Gera o QR code (base64) usando a lib "qrcode"
  const handleGerarQR = async () => {
    try {
      // 'codigo' é a string que o usuário digitou (ex: "MASP.00610").
      // Gera uma imagem em base64
      const url = await QRCode.toDataURL(codigo);
      setQrDataUrl(url);
    } catch (err) {
      console.error("Erro ao gerar QR code:", err);
    }
  };

  // Baixa o arquivo PNG gerado
  const handleDownload = () => {
    if (!qrDataUrl) return;
    // Cria um link <a> "virtual" para forçar download do base64
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qrcode_${codigo}.png`;
    a.click();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Gerar QR Code</h1>
      <p>Insira o ID da obra ou local para gerar:</p>

      <input
        type="text"
        placeholder="Ex: MASP.00610"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        style={{ width: "240px", margin: "10px 0" }}
      />
      <br />

      <button onClick={handleGerarQR}>Gerar</button>

      {/* Se já temos um QR gerado, exibe a imagem e botões de download/imprimir */}
      {qrDataUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>QR Code para: <em>{codigo}</em></h3>
          <img src={qrDataUrl} alt="QR Code" />
          <br />
          <button onClick={handleDownload}>Baixar</button>
          <button onClick={() => window.print()}>Imprimir</button>
        </div>
      )}
    </div>
  );
}
