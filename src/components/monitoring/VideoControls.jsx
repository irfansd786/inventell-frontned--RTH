import React from 'react';
import Button from '../common/Button';
import { Play, Pause, Square, Camera as CameraIcon, Maximize, RotateCcw, Video } from 'lucide-react';

export default function VideoControls({
  isPlaying,
  onTogglePlay,
  onStop,
  onSnapshot,
  selectedCamera,
  onSelectCamera,
}) {
  const cameras = [
    { id: 'cam-1', name: 'Camera 01 — Main Entrance' },
    { id: 'cam-2', name: 'Camera 02 — Beverage Zone' },
    { id: 'cam-3', name: 'Camera 03 — Checkout Counter 2' },
    { id: 'cam-4', name: 'Camera 04 — Back Warehouse Gate' },
  ];

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
      {/* Left: Playback Controls */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant={isPlaying ? 'secondary' : 'primary'}
          size="sm"
          icon={isPlaying ? Pause : Play}
          onClick={onTogglePlay}
        >
          {isPlaying ? 'Pause Feed' : 'Play Feed'}
        </Button>

        <Button variant="outline" size="sm" icon={Square} onClick={onStop}>
          Stop
        </Button>

        <Button variant="outline" size="sm" icon={CameraIcon} onClick={onSnapshot}>
          Snapshot
        </Button>
      </div>

      {/* Right: Camera Switcher Selector */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <Video className="w-4 h-4 text-slate-400" />
        <select
          value={selectedCamera}
          onChange={(e) => onSelectCamera(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {cameras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
