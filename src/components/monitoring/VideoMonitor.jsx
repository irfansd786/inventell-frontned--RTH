import React, { useState } from 'react';
import { Camera, Maximize2, RefreshCw, Volume2, ShieldCheck } from 'lucide-react';

export default function VideoMonitor({ boxes, isPlaying = true }) {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div
      className={`relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl transition-all ${
        fullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'aspect-video w-full'
      }`}
    >
      {/* CCTV Store Grid Simulation */}
      <div className="absolute inset-0 bg-slate-900 opacity-95 flex flex-col justify-between p-6">
        <div className="grid grid-cols-3 gap-4 h-full border border-slate-800 rounded-xl p-4 bg-slate-900/60">
          <div className="border border-slate-800/80 rounded-lg bg-slate-800/20 p-3 flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-500">ZONE 1: BEVERAGES</span>
            <div className="w-full h-1 bg-emerald-500/30 rounded-full" />
          </div>
          <div className="border border-slate-800/80 rounded-lg bg-slate-800/20 p-3 flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-500">ZONE 2: SNACKS & FOOD</span>
            <div className="w-full h-1 bg-amber-500/30 rounded-full" />
          </div>
          <div className="border border-slate-800/80 rounded-lg bg-slate-800/20 p-3 flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-500">ZONE 3: CHECKOUT COUNTERS</span>
            <div className="w-full h-1 bg-rose-500/30 rounded-full" />
          </div>
        </div>
      </div>

      {/* CCTV CRT Scanline Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

      {/* Animated Simulated Bounding Boxes */}
      {isPlaying &&
        boxes.map((box) => (
          <div
            key={box.id}
            style={{
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.width}%`,
              height: `${box.height}%`,
            }}
            className={`absolute border-2 rounded transition-all duration-500 flex flex-col justify-between p-1.5 backdrop-blur-[1px] shadow-lg ${
              box.status === 'queue'
                ? 'border-rose-500 bg-rose-500/10 shadow-rose-500/20'
                : 'border-emerald-400 bg-emerald-500/10 shadow-emerald-500/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs text-white ${
                  box.status === 'queue' ? 'bg-rose-600' : 'bg-emerald-600'
                }`}
              >
                {box.label}
              </span>
              <span className="text-[9px] font-mono text-emerald-300 bg-slate-900/90 px-1 rounded">
                Dwell: {box.dwell}
              </span>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-slate-300 bg-slate-900/80 px-1 py-0.5 rounded">
              <span>Class: Person</span>
              <span className="text-emerald-400">98.4%</span>
            </div>
          </div>
        ))}

      {/* CCTV Camera Header Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-full shadow-md">
            <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            <span>LIVE</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/90 text-slate-100 text-xs font-semibold rounded-full border border-slate-700/80 backdrop-blur-md">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Camera 01 — Main Entrance & Checkout</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 backdrop-blur-md transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> YOLOv8 + ByteTrack Processing
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline">Stream: 1080p @ 30 FPS</span>
        </div>
        <div>
          <span>Lat: 24ms</span>
        </div>
      </div>
    </div>
  );
}
