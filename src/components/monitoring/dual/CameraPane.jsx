// Single camera pane: stream, backend bounding boxes, playback controls.
// All controls are functional (play/pause, restart, speed, mute, snapshot,
// fullscreen). Snapshot captures the actual frame; failures are reported,
// never faked.

import React, { useRef, useState } from 'react';
import {
  Play, Pause, RotateCcw, Maximize2, Camera as SnapIcon,
  Volume2, VolumeX, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { StatusDot } from './Panel';
import { fmtClock, confLabel, CAMERA_META } from './utils';

const SPEEDS = [0.5, 1, 1.5, 2];

function stateOf(cam) {
  if (!cam.video) return { tone: 'red', text: 'OFFLINE' };
  const st = cam.status?.state;
  if (st === 'ready' || cam.connected || (cam.people && cam.people.length > 0)) return { tone: 'green', text: 'ONLINE' };
  if (st === 'processing') return { tone: 'blue', text: 'PROCESSING' };
  if (st === 'error') return { tone: 'red', text: 'ERROR' };
  return { tone: 'amber', text: 'STANDBY' };
}

export default function CameraPane({
  cam, people, time, duration, sel, onSelectPerson, onTime, onRetry, streamUrl,
}) {
  const videoRef = useRef(null);
  const paneRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [snapError, setSnapError] = useState('');
  const [isFull, setIsFull] = useState(false);

  const meta = CAMERA_META[cam.id] || { label: cam.id, role: '' };
  const st = stateOf(cam);
  const detector = cam.status?.detector || null;
  const fps = cam.video?.fps;
  const liveKind = cam.video?.kind === 'live';

  const doPlayPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); } else { v.pause(); }
  };

  const doRestart = () => {
    const v = videoRef.current;
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    onTime(cam.id, 0, duration || v?.duration || 0);
  };

  const doSpeed = (s) => {
    setSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
  };

  const doMute = () => {
    setMuted((m) => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  };

  const doSnapshot = () => {
    setSnapError('');
    try {
      const v = videoRef.current;
      if (!v || !v.videoWidth) { setSnapError('No frame available yet.'); return; }
      const c = document.createElement('canvas');
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      const a = document.createElement('a');
      a.href = c.toDataURL('image/png');
      a.download = `${cam.id}-${fmtClock(time).replace(':', 'm')}s.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setSnapError('Snapshot blocked for this stream.');
    }
  };

  const doFullscreen = async () => {
    try {
      if (document.fullscreenElement) { await document.exitFullscreen(); }
      else { await paneRef.current?.requestFullscreen?.(); }
    } catch { /* browser denied — control stays honest, no fake state */ }
  };

  const onFsChange = () => setIsFull(!!document.fullscreenElement);

  React.useEffect(() => {
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const ctrlBtn = 'p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer';

  return (
    <div ref={paneRef} className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col min-w-0">
      {/* header */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-slate-800">
        <span className="flex items-center gap-2 text-xs font-bold text-white min-w-0">
          <StatusDot tone={st.tone} pulse={st.tone === 'green'} />
          <span className="truncate">{meta.label} <span className="font-medium text-slate-400">· {meta.role}</span></span>
          <span className="text-[10px] font-bold text-slate-500">{st.text}</span>
        </span>
        <span className="text-[10px] font-mono text-slate-500 shrink-0 hidden sm:block">
          YOLOv8 · ByteTrack{detector ? ` · conf ≥ ${detector.confidence_threshold}` : ''}{fps ? ` · ${fps} fps` : ''}
        </span>
      </div>

      {/* source strip */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-1.5 bg-slate-900/70 text-[10px] font-semibold text-slate-400">
        <span>
          Source: {cam.video ? (liveKind ? 'Live Stream' : 'Uploaded Video') : 'Unavailable'}
          {' · '}
          <span className={liveKind ? 'text-rose-400' : 'text-blue-400'}>
            {liveKind ? '● LIVE' : '● VIDEO ANALYSIS'}
          </span>
        </span>
        <span className="font-mono">{fmtClock(time)} / {fmtClock(duration)}</span>
      </div>

      {/* video + overlay */}
      <div className="relative bg-black flex items-center justify-center min-h-[300px] flex-1 overflow-hidden">
        {cam.video ? (
          <div className="relative w-full aspect-video flex items-center justify-center">
            <video
              key={cam.id}
              ref={videoRef}
              src={streamUrl(cam.id)}
              className="w-full h-full object-contain aspect-video"
              playsInline
              muted={muted}
              loop
              autoPlay
              onTimeUpdate={(e) => onTime(cam.id, e.target.currentTime || 0, e.target.duration || 0)}
              onSeeked={(e) => onTime(cam.id, e.target.currentTime || 0, e.target.duration || 0)}
              onLoadedMetadata={(e) => {
                e.target.playbackRate = speed;
                onTime(cam.id, e.target.currentTime || 0, e.target.duration || 0, true);
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />

            {/* backend person boxes */}
            {(people || []).map((p) => {
              const fw = p.frame?.width || 0;
              const fh = p.frame?.height || 0;
              const bbox = Array.isArray(p.bbox) && p.bbox.length === 4 ? p.bbox : null;
              if (!bbox || !fw || !fh) return null;
              const [x1, y1, x2, y2] = bbox;
              const isSel = (sel?.cam === cam.id && String(sel?.id) === String(p.id)) ||
                (sel?.global_id && p.global_id && String(sel.global_id) === String(p.global_id));
              const camPrefix = cam.id === 'camera_01' ? 'C1' : 'C2';
              const gidCode = p.global_code || (p.global_id ? `G${String(p.global_id).padStart(2, '0')}` : null);
              return (
                <div
                  key={`${cam.id}-${p.id}`}
                  onClick={() => onSelectPerson(cam.id, p.id, p.global_id)}
                  className={`absolute border-2 rounded-sm cursor-pointer transition-colors ${
                    isSel
                      ? 'border-amber-400 bg-amber-400/15 ring-2 ring-amber-400/50 z-20'
                      : p.is_merged
                      ? 'border-purple-400 bg-purple-500/20 ring-1 ring-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.35)] z-10'
                      : 'border-emerald-500 bg-emerald-500/10'
                  }`}
                  style={{
                    left: `${(x1 / fw) * 100}%`,
                    top: `${(y1 / fh) * 100}%`,
                    width: `${((x2 - x1) / fw) * 100}%`,
                    height: `${((y2 - y1) / fh) * 100}%`,
                  }}
                >
                  <span
                    className={`absolute -top-5 left-0 text-[10px] font-mono font-bold px-1.5 py-px rounded whitespace-nowrap shadow-sm flex items-center gap-1 ${
                      isSel
                        ? 'bg-amber-500 text-slate-950'
                        : p.is_merged
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <span>{camPrefix}-{p.id}</span>
                    {gidCode && (
                      <span className={`px-1 rounded text-[9px] ${p.is_merged ? 'bg-purple-900 text-amber-300 font-extrabold' : 'bg-black/30 text-emerald-200'}`}>
                        {gidCode}{p.is_merged ? ' · SAME PERSON (1)' : ''}
                      </span>
                    )}
                    <span>· {confLabel(p)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500 text-xs p-8 text-center">
            <AlertTriangle className="w-6 h-6" />
            <strong>Camera unavailable</strong>
            <span>No video source for {meta.label}.</span>
            <button onClick={() => onRetry(cam.id)} className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-bold hover:bg-white/20 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* processing / error overlays */}
        {cam.video && cam.status?.state === 'processing' && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-blue-600/90 text-white text-[10px] font-bold">
            Analyzing… {cam.status?.progress ?? 0}%
          </div>
        )}
        {cam.video && cam.status?.state === 'error' && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-rose-950/90 text-rose-200 text-[11px] font-medium flex items-center justify-between gap-2">
            <span className="truncate">Analysis failed: {cam.status?.error || 'unknown error'}</span>
            <button onClick={() => onRetry(cam.id)} className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold hover:bg-rose-500 cursor-pointer">
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}
      </div>

      {/* controls */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-900/90 border-t border-slate-800">
        <button onClick={doPlayPause} className={ctrlBtn} title={playing ? 'Pause' : 'Play'} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button onClick={doRestart} className={ctrlBtn} title="Restart from beginning" aria-label="Restart">
          <RotateCcw className="w-4 h-4" />
        </button>
        <label className="flex items-center gap-1 text-[10px] font-mono text-slate-400 ml-1" title="Playback speed">
          <select
            value={speed}
            onChange={(e) => doSpeed(Number(e.target.value))}
            className="bg-transparent text-slate-300 text-[11px] font-bold focus:outline-none cursor-pointer"
            aria-label="Playback speed"
          >
            {SPEEDS.map((s) => <option key={s} value={s} className="text-slate-900">{s}×</option>)}
          </select>
        </label>
        <button onClick={doMute} className={ctrlBtn} title={muted ? 'Unmute' : 'Mute'} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <span className="flex-1" />
        {snapError && <span className="text-[10px] text-amber-400 font-medium mr-1">{snapError}</span>}
        <button onClick={doSnapshot} className={ctrlBtn} title="Capture current frame" aria-label="Snapshot">
          <SnapIcon className="w-4 h-4" />
        </button>
        <button onClick={doFullscreen} className={ctrlBtn} title={isFull ? 'Exit fullscreen' : 'Fullscreen'} aria-label="Fullscreen">
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
