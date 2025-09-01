
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Image as ImageIcon, Trash2, X, Check } from 'lucide-react';
import NextImage from 'next/image';
import CameraFeed from './CameraFeed';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';

const CAMERA_WIDTH = 160;
const CAMERA_HEIGHT = 160;

const PALETTE = [
  [0, 0, 0],       // Black
  [85, 85, 85],    // Dark Gray
  [170, 170, 170], // Light Gray
  [255, 255, 255], // White
];

const BAYER_MATRIX = [
  [0, 128, 32, 160],
  [192, 64, 224, 96],
  [48, 176, 16, 144],
  [240, 112, 208, 80],
];

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};


type UploadState = 'options' | 'camera' | 'preview';

export const PhotoUpload = ({ onPhotoSelect, onViewChange }: {
  onPhotoSelect: (dataUrl: string) => void;
  onViewChange?: (view: 'options' | 'camera' | 'preview') => void;
}) => {
  const [uploadState, setUploadState] = useState<UploadState>('options');
  const [imageData, setImageData] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Notify parent component of view change
    onViewChange?.(uploadState);
  }, [uploadState, onViewChange]);

  const applyGameboyFilter = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const contrast = 1.8;
    const brightness = 25;
    const ditherStrength = 0.4;

    for (let i = 0; i < data.length; i += 4) {
      let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      
      gray += brightness;
      gray = clamp(contrast * (gray - 128) + 128, 0, 255);

      const x = (i / 4) % canvas.width;
      const y = Math.floor((i / 4) / canvas.width);
      const dither = (BAYER_MATRIX[y % 4][x % 4] - 128) * ditherStrength;
      const ditheredGray = clamp(gray + dither, 0, 255);
      
      let quantized = Math.floor(ditheredGray / 64);
      if (isNaN(quantized)) quantized = 0;
      
      const color = PALETTE[clamp(quantized, 0, 3)];

      if (color) {
        data[i] = color[0];
        data[i + 1] = color[1];
        data[i + 2] = color[2];
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = CAMERA_WIDTH;
            canvas.height = CAMERA_HEIGHT;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const hRatio = canvas.width / img.width;
              const vRatio = canvas.height / img.height;
              const ratio = Math.max(hRatio, vRatio);
              const centerShift_x = (canvas.width - img.width * ratio) / 2;
              const centerShift_y = (canvas.height - img.height * ratio) / 2;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, img.width, img.height,
                            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
              
              const filteredDataUrl = applyGameboyFilter(canvas);
              if (filteredDataUrl) {
                setImageData(filteredDataUrl);
                setUploadState('preview');
                onPhotoSelect(filteredDataUrl);
              }
            }
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: CAMERA_WIDTH },
          height: { ideal: CAMERA_HEIGHT },
          facingMode: 'user'
        }
      });
      setStream(mediaStream);
      setUploadState('camera');
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = CAMERA_WIDTH;
      canvas.height = CAMERA_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        const filteredDataUrl = applyGameboyFilter(canvas);
        if (filteredDataUrl) {
          setImageData(filteredDataUrl);
          setUploadState('preview');
          onPhotoSelect(filteredDataUrl);
          stopCamera();
        }
      }
    }
  };

  const handleCameraClick = () => {
    startCamera();
  };

  const handleLibraryClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleCancel = () => {
    stopCamera();
    setUploadState('options');
    setImageData(null);
  };
  
  const handleDelete = () => {
    setUploadState('options');
    setImageData(null);
  };

  const renderContent = () => {
    switch (uploadState) {
      case 'camera':
        return (
          <div className="flex gap-4 items-start w-full">
            <div className="w-40 h-40 rounded-lg overflow-hidden flex-shrink-0 bg-black">
              <CameraFeed ref={videoRef} stream={stream} />
            </div>
            <div className="flex flex-col gap-2">
              <IconButton onClick={handleCapture} icon={Check} />
              <IconButton onClick={handleCancel} icon={X} variant="outline" />
            </div>
          </div>
        );
      case 'preview':
        return (
          <div className="flex gap-4 items-start w-full">
            <div className="w-40 h-40 rounded-lg overflow-hidden flex-shrink-0">
              {imageData && <NextImage src={imageData} alt="Preview" width={CAMERA_WIDTH} height={CAMERA_HEIGHT} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />}
            </div>
            <div className="flex flex-col gap-2">
              <IconButton onClick={handleDelete} icon={Trash2} variant="outline" />
            </div>
          </div>
        );
      case 'options':
      default:
        return (
          <div className="flex gap-4 w-full">
            <Button onClick={handleCameraClick} className="flex-1" variant="secondary">
              <Camera size={20} className="mr-2" />
              Camera
            </Button>
            <Button onClick={handleLibraryClick} className="flex-1" variant="secondary">
              <ImageIcon size={20} className="mr-2" />
              Library
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
      <p className="text-xs font-medium text-white/40 mb-2">Profile photo</p>
      <div className="flex items-center justify-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />
        {renderContent()}
      </div>
    </div>
  );
};

export default PhotoUpload;
