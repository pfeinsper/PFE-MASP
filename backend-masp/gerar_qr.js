// gerar_qr.js
const QRCode = require("qrcode");
const fs = require("fs");

async function gerarQRCode(texto, caminhoArquivo) {
  try {
    // Gera o QR code em dataURL (base64)
    const url = await QRCode.toDataURL(texto);
    // Remove a parte inicial "data:image/png;base64,"
    const base64Data = url.replace(/^data:image\/png;base64,/, "");
    // Salva em arquivo .png
    fs.writeFileSync(caminhoArquivo, base64Data, "base64");
    console.log(`QR Code gerado: ${caminhoArquivo} (para o texto "${texto}")`);
  } catch (err) {
    console.error("Erro ao gerar QR code:", err);
  }
}

// Exemplo: gerar QR para obra "MASP.00610" e local "2533"
gerarQRCode("MASP.00610", "obra_MASP_00610.png");
gerarQRCode("2533", "local_2533.png");

// Você pode rodar: node gerar_qr.js
// Isso vai gerar dois arquivos PNG com os QR codes.
