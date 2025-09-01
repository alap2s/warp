'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

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

interface CameraFeedProps {
  stream: MediaStream | null;
  isFilterEnabled?: boolean;
  contrast?: number;
  brightness?: number;
  ditherStrength?: number;
}

const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(({
  stream,
  isFilterEnabled = true,
  contrast = 1.8,
  brightness = 25,
  ditherStrength = 0.4,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(err => {
        if (err.name !== 'AbortError') {
          console.error("Video play failed:", err);
        }
      });
    }
  }, [stream]);

  useEffect(() => {
    let animationFrameId: number;
    const renderFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const hRatio = canvas.width / video.videoWidth;
        const vRatio = canvas.height / video.videoHeight;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - video.videoWidth * ratio) / 2;
        const centerShift_y = (canvas.height - video.videoHeight * ratio) / 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          video,
          0,
          0,
          video.videoWidth,
          video.videoHeight,
          centerShift_x,
          centerShift_y,
          video.videoWidth * ratio,
          video.videoHeight * ratio
        );

        if (isFilterEnabled) {
          const imageData = ctx.getImageData(0, 0, CAMERA_WIDTH, CAMERA_HEIGHT);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            
            gray += brightness;
            gray = clamp(contrast * (gray - 128) + 128, 0, 255);

            const x = (i / 4) % CAMERA_WIDTH;
            const y = Math.floor((i / 4) / CAMERA_WIDTH);
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
        }
      }
      animationFrameId = requestAnimationFrame(renderFrame);
    };
    
    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isFilterEnabled, contrast, brightness, ditherStrength, stream]);

  return (
    <>
      <video ref={videoRef} autoPlay playsInline muted className="hidden" width={CAMERA_WIDTH} height={CAMERA_HEIGHT} />
      <canvas
        ref={canvasRef}
        width={CAMERA_WIDTH}
        height={CAMERA_HEIGHT}
        className="w-full h-full scale-x-[-1]"
        style={{ imageRendering: 'pixelated' }}
      />
    </>
  );
});

CameraFeed.displayName = 'CameraFeed';
export default CameraFeed;
