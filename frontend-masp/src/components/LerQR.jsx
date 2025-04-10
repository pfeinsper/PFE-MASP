// src/components/LerQR.jsx
import React, { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

export default function LerQR({ onScanResult, onClose }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    // 🔥 CORREÇÃO: limpa o conteúdo anterior
    const readerElem = document.getElementById("reader");
    if (readerElem) {
      readerElem.innerHTML = "";
    }

    // Inicia o scanner
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          console.log("✅ QR detectado:", decodedText);
          scanner
            .stop()
            .catch(() => {}) // ignora erro se scanner já estiver parado
            .finally(() => {
              onScanResult(decodedText);
            });
        },
        (errorMessage) => {
          // Erros "normais" como NotFound são ignorados aqui
        }
      )
      .catch((err) => {
        console.error("Erro ao iniciar câmera:", err);
      });

    // Cleanup: parar o scanner ao desmontar
    return () => {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        if (
          state === Html5QrcodeScannerState.SCANNING ||
          state === Html5QrcodeScannerState.PAUSED
        ) {
          scannerRef.current.stop().catch(() => {});
        }
      }
    };
  }, [onScanResult]);

  return (
    <div style={{ textAlign: "center" }}>
      <div id="reader" style={{ width: "100%", maxWidth: "500px" }} />
      <button
        style={{ marginTop: "20px" }}
        onClick={() => {
          if (scannerRef.current) {
            const state = scannerRef.current.getState();
            if (
              state === Html5QrcodeScannerState.SCANNING ||
              state === Html5QrcodeScannerState.PAUSED
            ) {
              scannerRef.current.stop().catch(() => {});
            }
          }
          onClose && onClose();
        }}
      >
        Fechar
      </button>
    </div>
  );
}
