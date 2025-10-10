'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface MobileScannerProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function MobileScanner({ onCapture, onClose }: MobileScannerProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `scan-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            });
            onCapture(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full w-full">
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 z-10 p-3 bg-white/20 rounded-full backdrop-blur-sm"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {!stream ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
            <button
              onClick={startCamera}
              className="flex flex-col items-center gap-3 p-8 bg-blue-600 rounded-2xl min-w-[200px] min-h-[120px] active:scale-95 transition-transform"
            >
              <Camera className="w-12 h-12 text-white" />
              <span className="text-white font-medium">Open Camera</span>
            </button>

            <label className="flex flex-col items-center gap-3 p-8 bg-gray-700 rounded-2xl min-w-[200px] min-h-[120px] active:scale-95 transition-transform cursor-pointer">
              <Upload className="w-12 h-12 text-white" />
              <span className="text-white font-medium">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <button
                onClick={captureImage}
                className="w-20 h-20 bg-white rounded-full border-4 border-blue-600 active:scale-90 transition-transform"
              />
            </div>
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
