import React, { useState } from "react";
import QRCode from "qrcode";

export default function CriarQRCodeManual() {
  const [codigo, setCodigo] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  const handleGerarQR = async () => {
    if (!codigo.trim()) return;
    try {
      const url = await QRCode.toDataURL(codigo);
      setQrDataUrl(url);
    } catch (err) {
      console.error("Erro ao gerar QR code:", err);
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
      <p>Digite o <strong>ID da obra</strong> ou <strong>ID do local</strong> para gerar o QR Code.</p>

      <input
        type="text"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Ex: MASP.00610 ou 2533"
        style={{ width: "80%", padding: "10px", marginBottom: "10px" }}
      />
      <br />
      <button onClick={handleGerarQR}>Gerar QR Code</button>

      {qrDataUrl && (
        <div style={{ marginTop: "30px" }}>
          <h3>Resultado para: <em>{codigo}</em></h3>
          <img src={qrDataUrl} alt="QR Code" style={{ maxWidth: "200px" }} />
          <br />
          <button onClick={handleDownload}>Baixar</button>
          <button onClick={() => window.print()}>Imprimir</button>
        </div>
      )}
    </div>
  );
}
