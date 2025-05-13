// src/components/LerQR.jsx
import React, { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

export default function LerQR({ onScanResult, onClose }) {
  const scannerRef = useRef(null);
  const scannerContainerId = "reader";

  useEffect(() => {
    const scanner = new Html5Qrcode(scannerContainerId);
    scannerRef.current = scanner;

    const readerElem = document.getElementById(scannerContainerId);
    if (readerElem) {
      readerElem.innerHTML = "";
    }

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.333,
        },
        (decodedText) => {
          console.log("✅ QR detectado:", decodedText);
          scanner
            .stop()
            .catch(() => {})
            .finally(() => {
              onScanResult(decodedText);
            });
        },
        (err) => {}
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
    <div style={{ textAlign: "center" }}>
      <div
        id={scannerContainerId}
        style={{
          width: "80vw",            // usa largura da tela no mobile
          maxWidth: "360px",
          aspectRatio: "1 / 1",     // força quadrado
          overflow: "hidden",
          margin: "0 auto",
          borderRadius: "10px",
          backgroundColor: "#000",  // evita tela piscando fora do quadrado
        }}
      />
      <button
        style={{
          marginTop: "20px",
          backgroundColor: "#d50000",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
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