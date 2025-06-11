const QRCode = require("qrcode");
const fs = require("fs");

async function gerarQRCode(texto, caminhoArquivo) {
  try {

    const url = await QRCode.toDataURL(texto);
    const base64Data = url.replace(/^data:image\/png;base64,/, "");

    fs.writeFileSync(caminhoArquivo, base64Data, "base64");
    console.log(`QR Code gerado: ${caminhoArquivo} (para o texto "${texto}")`);

  } catch (err) {
    console.error("Erro ao gerar QR code:", err);
  }
}
