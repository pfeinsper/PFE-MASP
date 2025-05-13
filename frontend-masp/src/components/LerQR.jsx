import React, { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import "./LerQR.css"; // ✅ Certifique-se de importar o CSS

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
          qrbox: { width: 100, height: 100 },
          aspectRatio: 1.0, // ✅ quadrado
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
    <div className="lerqr-container">
      {/* ⚠️ Sem inline style de height! */}
      <div id={scannerContainerId}></div>

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