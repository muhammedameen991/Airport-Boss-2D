import React, { useRef, useEffect } from 'react';
import { Plus, Minus, Crosshair } from 'lucide-react';
import { PlacedBuilding, AircraftEntity } from '../types';
import { soundManager } from '../audio/soundManager';

interface MinimapWidgetProps {
  buildings: PlacedBuilding[];
  aircraftList: AircraftEntity[];
  camera: { x: number; y: number; zoom: number };
  onMoveCamera: (x: number, y: number) => void;
  onZoom: (delta: number) => void;
  onResetCamera: () => void;
}

export const MinimapWidget: React.FC<MinimapWidgetProps> = ({
  buildings,
  aircraftList,
  camera,
  onMoveCamera,
  onZoom,
  onResetCamera,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, w, h);

    // Map bounds: world x (0 to 1800) -> w (0 to 180), world y (0 to 1400) -> h (0 to 120)
    const scaleX = w / 1800;
    const scaleY = h / 1400;

    // Airfield apron
    ctx.fillStyle = '#334155';
    ctx.fillRect(140 * scaleX, 280 * scaleY, 1500 * scaleX, 400 * scaleY);

    // Runway 27
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(200 * scaleX, 160 * scaleY, 1280 * scaleX, 80 * scaleY);

    // Taxiway
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(220 * scaleX, 360 * scaleY, 1240 * scaleX, 40 * scaleY);

    // Terminal building
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(320 * scaleX, 660 * scaleY, 960 * scaleX, 260 * scaleY);

    // Aircraft dots
    aircraftList.forEach((ac) => {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(ac.x * scaleX, ac.y * scaleY, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Camera viewport rectangle
    const vpW = (800 / camera.zoom) * scaleX;
    const vpH = (500 / camera.zoom) * scaleY;
    const vpX = camera.x * scaleX - vpW / 2;
    const vpY = camera.y * scaleY - vpH / 2;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vpX, vpY, vpW, vpH);
  }, [buildings, aircraftList, camera]);

  const handleMinimapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = 1800 / canvas.width;
    const scaleY = 1400 / canvas.height;

    onMoveCamera(clickX * scaleX, clickY * scaleY);
  };

  return (
    <div className="hidden md:flex relative bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-2 shadow-2xl z-20 select-none">
      <canvas
        ref={canvasRef}
        width={160}
        height={100}
        onClick={handleMinimapClick}
        className="rounded-xl border border-slate-700/60 cursor-crosshair bg-slate-950"
      />

      {/* Camera zoom / center controls */}
      <div className="absolute right-3.5 top-3.5 flex flex-col gap-1 bg-slate-900/90 border border-slate-700 rounded-lg p-0.5 shadow-md">
        <button
          onClick={() => {
            soundManager.playClick();
            onZoom(0.15);
          }}
          title="Zoom In"
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            onZoom(-0.15);
          }}
          title="Zoom Out"
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            soundManager.playClick();
            onResetCamera();
          }}
          title="Center Airport"
          className="p-1 text-slate-300 hover:text-sky-400 hover:bg-slate-800 rounded transition-colors"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
