"use client";
import { useApp } from "@/context/AppContext";
import { useRef, useEffect, useState } from "react";

export default function ScannerScreen() {
  const { dispatch } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setCameraActive(true);
        }
      })
      .catch(() => setCameraError(true));

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = () => {
    dispatch({ type: "NAVIGATE", screen: "processing" });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      dispatch({ type: "SET_IMAGE", image: ev.target?.result as string });
      dispatch({ type: "NAVIGATE", screen: "processing" });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-screen bg-black flex flex-col overflow-hidden">
      {/* Camera view */}
      {cameraActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          {cameraError && (
            <div className="text-white/60 text-center px-8">
              <span className="material-symbols-outlined text-4xl mb-2 block">no_photography</span>
              <p className="text-sm">Kamera tidak tersedia. Gunakan upload foto.</p>
            </div>
          )}
        </div>
      )}

      {/* Scanning overlay */}
      <div className="absolute inset-0 flex items-center justify-center px-8 z-10 pointer-events-none">
        <div className="w-full aspect-[1/1.4] border-2 border-primary-fixed border-dashed rounded-xl relative camera-overlay">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-fixed rounded-tl-xl -mt-1 -ml-1" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-fixed rounded-tr-xl -mt-1 -mr-1" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-fixed rounded-bl-xl -mb-1 -ml-1" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-fixed rounded-br-xl -mb-1 -mr-1" />
          {/* Scanning line */}
          <div
            className="animate-scan bg-primary-fixed"
            style={{ boxShadow: "0 0 12px rgba(151,243,230,0.7)" }}
          />
        </div>
      </div>

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 pt-10"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)" }}>
        <button
          onClick={() => dispatch({ type: "NAVIGATE", screen: "home" })}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2">
          <p className="text-white text-sm font-semibold">Arahkan ke nota / struk</p>
        </div>
        <div className="w-11 h-11" />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-12 pt-8 px-8 flex items-center justify-between"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.4), transparent)" }}>
        {/* Gallery button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-xl border border-white/30 flex items-center justify-center bg-white/20 backdrop-blur-sm active:scale-95 transition-transform"
          aria-label="Upload from gallery"
        >
          <span className="material-symbols-outlined text-white">photo_library</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

        {/* Capture button */}
        <button
          onClick={handleCapture}
          className="w-20 h-20 rounded-full border-4 border-white/80 p-1 flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Capture photo"
          id="capture-btn"
        >
          <div className="w-full h-full bg-white rounded-full" />
        </button>

        <div className="w-12 h-12" />
      </div>
    </div>
  );
}
