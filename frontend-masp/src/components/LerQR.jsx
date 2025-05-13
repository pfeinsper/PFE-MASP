// src/components/LerQR.jsx
import React, { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import "./LerQR.css";

export default function LerQR({ onScanResult, onClose }) {
  const scannerRef = useRef(null);
  const scannerContainerId = "reader";
  const BOX_SIZE = 300; // tamanho fixo do quadrado em pixels

  useEffect(() => {
    const scanner = new Html5Qrcode(scannerContainerId);
    scannerRef.current = scanner;

    // limpa container antes de iniciar
    const readerElem = document.getElementById(scannerContainerId);
    if (readerElem) readerElem.innerHTML = "";

    scanner
      .start(
        // ⚠️ aqui mudamos para string ou { exact: ... }
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: BOX_SIZE, height: BOX_SIZE },
          aspectRatio: 1, // força proporção 1:1
        },
        (decodedText) => {
          console.log("✅ QR detectado:", decodedText);
          scanner
            .stop()
            .catch(() => {})
            .finally(() => onScanResult(decodedText));
        },
        (errorMessage) => { /* ignora erros de leitura de frame */ }
      )
      .catch((err) => {
        console.error("Erro ao iniciar câmera:", err);
      });

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
    <div className="lerqr-container">
      <div id={scannerContainerId} />
      <button
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
