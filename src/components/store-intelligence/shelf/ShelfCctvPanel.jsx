import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Layers,
  AlertCircle,
  Eye,
  Camera,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { API_BASE_URL } from '../../../config/api';

export default function ShelfCctvPanel({
  cameraId = 'camera_02',
  cameraLabel = 'CAM-02 • Overhead Aisle View',
  resolution = '1080p',
  fps = 30,
  currentTracks = [],
  statusLabel = 'ANALYSIS RUNNING',
  zoneName = 'Beverages & Snacks Aisle',
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showDetections, setShowDetections] = useState(true);
  const [showPlanogramHud, setShowPlanogramHud] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const videoUrl = `${API_BASE_URL}/store-monitor/video/${cameraId}`;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const isConnected = statusLabel === 'ANALYSIS RUNNING' || statusLabel === 'VIDEO ANALYSIS';

  return (
    <div
      ref={containerRef}
      className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shadow-sm flex flex-col h-full"
    >
      {/* CCTV Viewport Container (16:9 aspect ratio) */}
      <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center overflow-hidden select-none group">
        {/* Real Video Element */}
        {!videoError ? (
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center">
            <Camera className="w-10 h-10 mb-2 text-slate-600 animate-pulse" />
            <p className="text-xs font-semibold text-slate-300">
              CCTV Stream Standby
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              FastAPI video feed endpoint ready. Ensure backend server is running with test video mounted.
            </p>
          </div>
        )}

        {/* Shelf Rack Floor Outline Perspective Graphic HUD */}
        {showPlanogramHud && (
          <div className="absolute inset-x-8 top-12 bottom-12 border border-slate-700/60 rounded bg-slate-950/25 flex flex-col justify-between p-3 pointer-events-none">
            {/* Top Tier */}
            <div className="h-[28%] w-full border-b border-slate-700/40 flex items-center justify-between px-2 text-[10px] text-slate-400 font-mono">
              <span className="bg-slate-900/80 px-1 rounded text-slate-300">TIER 3 (Top Shelf)</span>
              <span className="text-emerald-400/90 font-semibold bg-slate-900/80 px-1 rounded">Inventory Linked</span>
            </div>
            {/* Middle Tier (Eye Level) */}
            <div className="h-[36%] w-full border-b border-slate-700/40 flex items-center justify-between px-2 text-[10px] text-slate-400 font-mono bg-blue-950/15">
              <span className="text-blue-300 bg-slate-900/80 px-1 rounded">TIER 2 (Eye Level - High Velocity)</span>
              <span className="text-amber-300 font-semibold bg-slate-900/80 px-1 rounded">Fast Mover Focus</span>
            </div>
            {/* Bottom Tier */}
            <div className="h-[28%] w-full flex items-center justify-between px-2 text-[10px] text-slate-400 font-mono">
              <span className="bg-slate-900/80 px-1 rounded text-slate-300">TIER 1 (Base Shelf)</span>
              <span className="text-slate-300 bg-slate-900/80 px-1 rounded">Bulk / Heavy Packaging</span>
            </div>
          </div>
        )}

        {/* Real Person Tracking Detections Overlay (COCO class 0 only) */}
        {showDetections && currentTracks.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {currentTracks.map((t, idx) => {
              const x1 = Math.round((t.box?.[0] || 0.1) * 100);
              const y1 = Math.round((t.box?.[1] || 0.1) * 100);
              const x2 = Math.round((t.box?.[2] || 0.2) * 100);
              const y2 = Math.round((t.box?.[3] || 0.3) * 100);
              const width = Math.max(x2 - x1, 8);
              const height = Math.max(y2 - y1, 14);

              return (
                <div
                  key={t.track_id || idx}
                  className="absolute border-2 border-emerald-400 bg-emerald-500/10 rounded transition-all duration-300"
                  style={{
                    left: `${Math.min(Math.max(x1, 5), 85)}%`,
                    top: `${Math.min(Math.max(y1, 10), 75)}%`,
                    width: `${Math.min(width, 25)}%`,
                    height: `${Math.min(height, 40)}%`,
                  }}
                >
                  <div className="absolute -top-5 left-0 bg-emerald-600 text-white font-mono text-[9px] px-1 py-0.5 rounded shadow-sm whitespace-nowrap">
                    Person #{t.track_id}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* HUD Top-Left: Model Status */}
        <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 text-white rounded px-2.5 py-1 text-[10px] font-mono flex items-center gap-2 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-300">
            TRACKING: COCO CLASS 0 (PERSON)
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-semibold text-amber-400">
            SHELF MODEL: AWAITING CV
          </span>
        </div>

        {/* HUD Top-Right: Camera ID & Specs */}
        <div className="absolute top-2.5 right-2.5 bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 text-slate-300 rounded px-2.5 py-1 text-[10px] font-mono flex items-center gap-2 shadow-md">
          <span>{cameraLabel.split('•')[0].trim()}</span>
          <span className="text-slate-600">|</span>
          <span>{resolution}</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">{fps} FPS</span>
        </div>

        {/* Standby Alert Banner */}
        <div className="absolute bottom-3 inset-x-4 flex justify-center pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 text-slate-300 px-3 py-1 rounded-full text-[10px] font-mono flex items-center gap-2 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Overhead aisle view active • Customer dwell & zone analytics connected</span>
          </div>
        </div>
      </div>

      {/* Video Control Bar */}
      <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-300 select-none">
        {/* Play/Pause */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white transition active:scale-95"
            title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
          <span className="font-mono text-[11px] text-slate-400">
            {zoneName}
          </span>
        </div>

        {/* Toggle Controls: Planogram HUD, Person Detections, Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPlanogramHud(!showPlanogramHud)}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition flex items-center gap-1 ${
              showPlanogramHud
                ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Planogram HUD"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">Planogram HUD</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDetections(!showDetections)}
            className={`px-2 py-1 rounded text-[11px] font-mono border transition flex items-center gap-1 ${
              showDetections
                ? 'bg-blue-950/60 border-blue-600/60 text-blue-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Person Detections"
          >
            <Users className="w-3 h-3" />
            <span className="hidden sm:inline">Persons</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
