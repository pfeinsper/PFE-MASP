// src/pages/CriarQRCode.jsx
import React, { useState } from "react";
import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import api from "../services/api";

export default function CriarQRCode() {
  const [modo, setModo] = useState("Manual");
  const [codigo, setCodigo] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [nome, setNome] = useState("");
  const [textoQR, setTextoQR] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [progresso, setProgresso] = useState(0);

  const [loteTexto, setLoteTexto] = useState("");
  const [loteCsvCódigos, setLoteCsvCódigos] = useState([]);
  const [qrCodeZip, setQrCodeZip] = useState(null);

  const buscarNome = async (codigoDigitado) => {
    const numero = parseInt(codigoDigitado, 10);
    if (!isNaN(numero) && numero > 0) {
      try {
        const res = await api.get(`/locais/codigo/${numero}`);
        return { nome: res.data.nome, textoQR: res.data.codigo };
      } catch {
        throw new Error("Local não encontrado.");
      }
    } else {
      try {
        const res = await api.get(`/obras/codigo/${codigoDigitado}`);
        return { nome: res.data.titulo, textoQR: res.data.id };
      } catch {
        throw new Error("Obra não encontrada.");
      }
    }
  };

  const desenharQRCodeComTexto = async (codigoTexto) => {
    const url = await QRCode.toDataURL(codigoTexto);
    return new Promise((resolve) => {
      const qrImage = new Image();
      qrImage.src = url;
      qrImage.onload = () => {
        const qrSize = 100;
        const padding = 10;
        let fontSize = 24;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.font = `${fontSize}px Arial`;
        while (ctx.measureText(codigoTexto).width > qrSize && fontSize > 8) {
          fontSize--;
          ctx.font = `${fontSize}px Arial`;
        }
        const height = qrSize + padding + fontSize;
        canvas.width = qrSize;
        canvas.height = height;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(qrImage, 0, 0, qrSize, qrSize);
        ctx.fillStyle = "#000";
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(codigoTexto, qrSize / 2, qrSize + 2);
        resolve(canvas.toDataURL("image/png"));
      };
    });
  };

  const handleGerarQR = async () => {
    if (!codigo.trim()) return;
    setMensagem("");
    setQrDataUrl("");
    setNome("");
    setTextoQR("");

    try {
      const { nome: nomeEncontrado, textoQR: textoParaQR } = await buscarNome(codigo.trim());
      setNome(nomeEncontrado);
      setTextoQR(textoParaQR);
      const url = await desenharQRCodeComTexto(textoParaQR);
      setQrDataUrl(url);
    } catch (err) {
      setMensagem(err.message || "Erro ao buscar nome no servidor.");
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl || !textoQR) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `${textoQR.replace(/\//g, "__")}.png`;
    a.click();
  };

  const gerarLote = async (codigos) => {
    setQrCodeZip(null);
    setProgresso(0);
    try {
      const zip = new JSZip();
      for (let i = 0; i < codigos.length; i++) {
        const cod = codigos[i];
        try {
          const { textoQR } = await buscarNome(cod);
          const qr = await desenharQRCodeComTexto(textoQR);
          const nomeArquivo = textoQR.replace(/\//g, "__");
          zip.file(`${nomeArquivo}.png`, qr.split(",")[1], { base64: true });
        } catch (err) {
          console.error(`Erro ao processar ${cod}:`, err);
        }
        setProgresso(Math.round(((i + 1) / codigos.length) * 100));
      }
      const blob = await zip.generateAsync({ type: "blob" });
      setQrCodeZip(blob);
      setMensagem("QR Codes gerados com sucesso.");
    } catch (err) {
      setMensagem("Erro ao gerar QR Codes.");
    }
  };

  const handleProcessarTextoLote = async () => {
    const codigos = loteTexto
      .split(/[\n,\s]+/)
      .map((x) => x.trim())
      .filter((x) => x);
    if (codigos.length === 0) {
      setMensagem("Nenhum código válido informado.");
      return;
    }
    await gerarLote(codigos);
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setQrCodeZip(null);
    setProgresso(0);
    const reader = new FileReader();
    reader.onload = (e) => {
      const linhas = e.target.result.split("\n").map((x) => x.trim()).filter((x) => x);
      setLoteCsvCódigos(linhas);
    };
    reader.readAsText(file);
  };

  const handleProcessarCSV = async () => {
    if (loteCsvCódigos.length === 0) {
      setMensagem("Nenhum código válido no arquivo CSV.");
      return;
    }
    await gerarLote(loteCsvCódigos);
  };

  return (
    <div className="container">
      <h1>Gerar QR Code</h1>

      <label>Modo de Geração:</label>
      <select
        value={modo}
        onChange={(e) => {
          setModo(e.target.value);
          setCodigo("");
          setQrDataUrl("");
          setNome("");
          setTextoQR("");
          setMensagem("");
          setLoteTexto("");
          setLoteCsvCódigos([]);
          setQrCodeZip(null);
          setProgresso(0);
        }}
      >
        <option>Manual</option>
        <option>Lote via Texto</option>
        <option>Lote via CSV</option>
      </select>

      {modo === "Manual" && (
        <>
          <p className="TextoNormal">
            Digite o <strong>ID da obra</strong> ou <strong>ID do local</strong> para gerar o QR Code.
          </p>
          <input
            type="text"
            className="fullWidthInput"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ex: MASP.00610 ou 3013"
          />
          <button onClick={handleGerarQR}>Gerar QR Code</button>

          {mensagem && <p className="mensagem error">{mensagem}</p>}

          {qrDataUrl && (
            <div style={{ marginTop: "30px" }}>
              <h3>
                Resultado para: <em>{codigo}</em>
              </h3>
              {nome && <p>Identificado: <em>{nome}</em></p>}
              <img src={qrDataUrl} alt="QR Code" style={{ maxWidth: "200px" }} />
              <br />
              <button onClick={handleDownload}>Baixar</button>
            </div>
          )}
        </>
      )}

      {modo === "Lote via Texto" && (
        <>
          <p className="TextoNormal">
            Insira os códigos separados por vírgula, espaço ou quebra de linha.
          </p>
          <textarea
            className="fullWidthInput"
            rows="5"
            value={loteTexto}
            onChange={(e) => {
              setLoteTexto(e.target.value);
              setQrCodeZip(null);
              setProgresso(0);
            }}
            placeholder="Ex: MASP.00610, MASP.00611, 3013"
          />
          <button onClick={handleProcessarTextoLote}>Gerar QR Codes em Lote</button>
          {progresso > 0 && progresso < 100 && <p>Progresso: {progresso}%</p>}
          {qrCodeZip && <button onClick={() => saveAs(qrCodeZip, "qrcodes_lote.zip")}>Baixar ZIP</button>}
        </>
      )}

      {modo === "Lote via CSV" && (
        <>
          <p className="TextoNormal">Envie um arquivo <strong>.csv</strong> com os códigos (um por linha).</p>
          <input type="file" accept=".csv" onChange={handleCSVUpload} className="fullWidthInput" />
          {loteCsvCódigos.length > 0 && (
            <button onClick={handleProcessarCSV}>Gerar QR Codes</button>
          )}
          {progresso > 0 && progresso < 100 && <p>Progresso: {progresso}%</p>}
          {qrCodeZip && <button onClick={() => saveAs(qrCodeZip, "qrcodes_csv.zip")}>Baixar ZIP</button>}
        </>
      )}
    </div>
  );
}
