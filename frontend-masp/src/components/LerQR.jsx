import React, { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import "./LerQR.css";

export default function LerQR({ onScanResult, onClose }) {
  const scannerRef = useRef(null);
  const scannerContainerId = "reader";

  useEffect(() => {
    const readerElem = document.getElementById(scannerContainerId);
    // calcula 70% do menor lado do container
    const w = readerElem.clientWidth;
    const h = readerElem.clientHeight;
    const boxSize = Math.round(Math.min(w, h) * 0.7);

    const scanner = new Html5Qrcode(scannerContainerId);
    scannerRef.current = scanner;

    // limpa qualquer coisa
    readerElem.innerHTML = "";

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: boxSize, height: boxSize },
          aspectRatio: 4 / 3,
        },
        (decodedText) => {
          console.log("✅ QR detectado:", decodedText);
          scanner
            .stop()
            .catch(() => {})
            .finally(() => onScanResult(decodedText));
        },
        (err) => {
          /* ignorar falhas de frame */
        }
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
