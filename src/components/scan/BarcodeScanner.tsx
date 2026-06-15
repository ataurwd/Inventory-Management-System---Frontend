"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Spinner } from "@/components/ui/spinner";
import { Camera, RefreshCw } from "lucide-react";

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export function BarcodeScanner({ onScanSuccess, onScanError }: BarcodeScannerProps) {
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const containerId = "scanner-viewfinder-element";

  // Request camera list on mount
  useEffect(() => {
    let active = true;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!active) return;
        setInitializing(false);
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Default to back camera if available
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes("back") || 
            device.label.toLowerCase().includes("environment") ||
            device.label.toLowerCase().includes("rear")
          );
          setCameraId(backCamera ? backCamera.id : devices[0].id);
        } else {
          setError("No cameras found. Please verify camera connection.");
        }
      })
      .catch((err) => {
        if (!active) return;
        setInitializing(false);
        console.error("Error getting cameras", err);
        setError("Camera permission denied. Please allow camera access in browser settings.");
      });

    return () => {
      active = false;
      if (qrCodeRef.current) {
        if (qrCodeRef.current.isScanning) {
          qrCodeRef.current.stop().catch(err => console.error("Failed to stop scanner on unmount", err));
        }
      }
    };
  }, []);

  // Effect to start scanning when cameraId changes
  useEffect(() => {
    if (!cameraId) return;

    let active = true;

    const startScanner = async () => {
      try {
        if (qrCodeRef.current) {
          if (qrCodeRef.current.isScanning) {
            await qrCodeRef.current.stop();
          }
        } else {
          qrCodeRef.current = new Html5Qrcode(containerId);
        }

        if (!active) return;

        setIsScanning(true);
        setError(null);

        await qrCodeRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: (width, height) => {
              const w = width * 0.8;
              const h = height * 0.4;
              return { width: w, height: h }; // wide box for barcode
            },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            if (onScanError) {
              onScanError(errorMessage);
            }
          }
        );
      } catch (err) {
        console.error("Start scanner error", err);
        if (active) {
          setError("Failed to start camera feed. It might be in use by another application.");
          setIsScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      active = false;
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        qrCodeRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [cameraId, onScanSuccess, onScanError]);

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCameraId(e.target.value);
  };

  if (initializing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-xl shadow-sm space-y-4">
        <Spinner size="lg" className="text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Requesting camera permissions...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-4 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
      <div className="flex items-center justify-between w-full border-b pb-2">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          <span className="font-semibold text-base">Live Viewfinder</span>
        </div>
        
        {cameras.length > 1 && (
          <div className="flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={cameraId || ""}
              onChange={handleCameraChange}
              className="text-xs bg-muted border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary max-w-[150px] truncate"
            >
              {cameras.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.label || `Camera ${cameras.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg w-full text-center">
          {error}
        </div>
      )}

      <div className="relative w-full aspect-square bg-black overflow-hidden rounded-lg border flex items-center justify-center">
        <div id={containerId} className="w-full h-full" />
        
        {/* Animated Scan Box and Line */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[80%] h-[40%] border-2 border-primary/60 rounded-md relative flex items-center justify-center overflow-hidden">
              {/* Scan Line */}
              <div className="absolute left-0 w-full h-[2px] bg-primary shadow-[0_0_8px_var(--color-primary)] animate-[scanLine_2.5s_linear_infinite]" />
            </div>
          </div>
        )}
        
        <style jsx global>{`
          @keyframes scanLine {
            0% { transform: translateY(-70px); }
            50% { transform: translateY(70px); }
            100% { transform: translateY(-70px); }
          }
          #scanner-viewfinder-element video {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
          }
        `}</style>

        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm">
            Connecting to video stream...
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Align the barcode inside the target box.
      </p>
    </div>
  );
}
