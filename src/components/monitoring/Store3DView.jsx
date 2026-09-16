// 3D STORE VIEW — lightweight digital twin of the retail floor.
//
// Data contract (backend is the source of truth, never simulated):
// - zones: backend /store-monitor/zones items { id, name, count, status, polygon }
// - people: backend map people { id, x (0..100), y (0..70), zone, confidence, dwell }
// - trails: { [personId]: [{ x, y }] } accumulated from REAL polls only.
// Markers use foot-point mapped positions; movement is frame-interpolated.

import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import StoreMapView from './StoreMapView';
import {
  WORLD_W,
  WORLD_D,
  ZONE_DEFS,
  isShelfZone,
  mapToWorld,
  mergeZones,
  rectToWorld,
  shelvesForZone,
  zoneStatusColor,
} from '../../utils/store3d';

const PRODUCT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

// ---------- camera controller for Upside (Top-Down) vs Angled 3D ----------
function CameraController({ cameraMode, controlsRef }) {
  const { camera } = useThree();
  React.useEffect(() => {
    if (cameraMode === 'top') {
      // Optimal overhead upside view height — fills frustum nicely
      camera.position.set(0, 17, 0.001);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    } else {
      // Optimal angled 3D perspective — up close & immersive
      camera.position.set(0, 13, 14);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    }
  }, [cameraMode, camera, controlsRef]);
  return null;
}

// ---------- person marker (interpolated) ----------
function PersonMarker({ person, selected, dark, labelLift, onSelect }) {
  const group = useRef(null);
  const target = useMemo(() => mapToWorld(person.x, person.y), [person.x, person.y]);
  useFrame((_, dt) => {
    if (!group.current) return;
    const k = 1 - Math.exp(-6 * Math.min(dt, 0.05));
    group.current.position.x += (target[0] - group.current.position.x) * k;
    group.current.position.z += (target[2] - group.current.position.z) * k;
  });
  const isMerged = !!person.is_merged || person.cam === 'both';
  const body = selected ? '#f59e0b' : isMerged ? '#a855f7' : '#10b981';
  const ringColor = selected ? '#f59e0b' : isMerged ? '#c084fc' : '#34d399';
  const conf = person.confidence === undefined || person.confidence === null
    ? '—'
    : `${Math.round(Number(person.confidence) * 100)}%`;
  const globalLabel = person.global_label || (person.global_id ? `GLOBAL ${String(person.global_id).padStart(3, '0')}` : `PERSON ${person.id}`);
  return (
    <group
      ref={group}
      position={[target[0], 0, target[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(person.id);
      }}
    >
      {/* base ring */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.45, 24]} />
        <meshBasicMaterial color={body} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* outer radar ring for clear upside view */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.72, 24]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* body */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 1.1, 12]} />
        <meshStandardMaterial color={body} roughness={0.6} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.19, 14, 14]} />
        <meshStandardMaterial color={selected ? '#fbbf24' : isMerged ? '#d8b4fe' : '#34d399'} roughness={0.5} />
      </mesh>
      {/* floating label */}
      <Html position={[0, 1.95 + labelLift, 0]} center distanceFactor={16} style={{ pointerEvents: 'auto' }}>
        <button
          onClick={() => onSelect?.(person.id)}
          title={`${globalLabel} — ${person.zone || 'unknown zone'}`}
          style={{
            pointerEvents: 'auto',
            whiteSpace: 'nowrap',
            fontSize: 10,
            fontWeight: 800,
            lineHeight: 1.25,
            padding: '3px 8px',
            borderRadius: 8,
            border: `1px solid ${selected ? '#f59e0b' : isMerged ? '#a855f7' : dark ? '#10b981' : '#059669'}`,
            background: dark ? 'rgba(2,6,23,0.92)' : 'rgba(255,255,255,0.95)',
            color: dark ? '#fff' : '#0f172a',
            cursor: 'pointer',
          }}
        >
          {globalLabel} · {conf}
          {isMerged && (
            <span style={{ display: 'inline-block', marginLeft: 4, padding: '1px 4px', borderRadius: 4, background: '#a855f7', color: '#fff', fontSize: 8 }}>
              LINKED C1+C2
            </span>
          )}
          <span style={{ display: 'block', fontSize: 9, fontWeight: 700, opacity: 0.75 }}>
            {person.zone_name || person.zone || ''}
          </span>
        </button>
      </Html>
    </group>
  );
}

// ---------- zone overlay with pulse for busy/critical ----------
function ZoneOverlay({ zone, dark }) {
  const mat = useRef(null);
  const base = zoneStatusColor(zone.status, dark);
  useFrame(({ clock }) => {
    if (!mat.current) return;
    const active = zone.status === 'busy' || zone.status === 'critical' || zone.status === 'crowded';
    mat.current.opacity = active
      ? 0.22 + 0.1 * Math.sin(clock.elapsedTime * 2.4)
      : 0.14;
  });
  const y = 0.02;
  const corners = useMemo(() => {
    const hw = zone.w / 2;
    const hd = zone.d / 2;
    return [
      [zone.cx - hw, y, zone.cz - hd],
      [zone.cx + hw, y, zone.cz - hd],
      [zone.cx + hw, y, zone.cz + hd],
      [zone.cx - hw, y, zone.cz + hd],
      [zone.cx - hw, y, zone.cz - hd],
    ];
  }, [zone.cx, zone.cz, zone.w, zone.d]);
  return (
    <group>
      <mesh position={[zone.cx, y, zone.cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[zone.w, zone.d]} />
        <meshBasicMaterial ref={mat} color={base} transparent opacity={0.14} depthWrite={false} />
      </mesh>
      <Line points={corners} color={base} lineWidth={1.5} transparent opacity={0.9} />
      <Html position={[zone.cx, 0.12, zone.cz]} center distanceFactor={22}>
        <div
          style={{
            textAlign: 'center',
            pointerEvents: 'none',
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: 0.4,
            color: dark ? '#e2e8f0' : '#0f172a',
            background: dark ? 'rgba(2,6,23,0.72)' : 'rgba(255,255,255,0.78)',
            border: `1px solid ${base}55`,
            borderRadius: 7,
            padding: '2px 7px',
            whiteSpace: 'nowrap',
          }}
        >
          {zone.name}
          <span style={{ display: 'block', fontSize: 9, color: base, fontWeight: 800 }}>
            {zone.count} {zone.count === 1 ? 'PERSON' : 'PEOPLE'}
          </span>
        </div>
      </Html>
    </group>
  );
}

// ---------- heatmap cells from real trail points ----------
function HeatmapLayer({ trails, people }) {
  const cells = useMemo(() => {
    const GX = 20;
    const GZ = 14;
    const grid = new Map();
    let total = 0;
    const push = (x, y) => {
      const [wx, , wz] = mapToWorld(x, y);
      const gx = Math.max(0, Math.min(GX - 1, Math.floor(((wx / WORLD_W) + 0.5) * GX)));
      const gz = Math.max(0, Math.min(GZ - 1, Math.floor(((wz / WORLD_D) + 0.5) * GZ)));
      const key = `${gx}:${gz}`;
      grid.set(key, (grid.get(key) || 0) + 1);
      total += 1;
    };
    Object.values(trails || {}).forEach((pts) => (pts || []).forEach((p) => push(p.x, p.y)));
    (people || []).forEach((p) => push(p.x, p.y));
    if (total === 0) return { list: [], total };
    let max = 1;
    grid.forEach((v) => {
      if (v > max) max = v;
    });
    const list = [];
    grid.forEach((v, key) => {
      const [gx, gz] = key.split(':').map(Number);
      const t = v / max;
      list.push({ gx, gz, t });
    });
    return { list, total };
  }, [trails, people]);
  if (cells.total < 5) return null;
  return (
    <group>
      {cells.list.map((c, i) => {
        const w = WORLD_W / 20;
        const d = WORLD_D / 14;
        const cx = -WORLD_W / 2 + (c.gx + 0.5) * w;
        const cz = -WORLD_D / 2 + (c.gz + 0.5) * d;
        const color = c.t > 0.66 ? '#ef4444' : c.t > 0.33 ? '#f59e0b' : '#10b981';
        return (
          <mesh key={i} position={[cx, 0.035, cz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w * 0.94, d * 0.94]} />
            <meshBasicMaterial color={color} transparent opacity={0.22 + 0.5 * c.t} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function heatmapPointCount(trails, people) {
  let n = (people || []).length;
  Object.values(trails || {}).forEach((pts) => {
    n += (pts || []).length;
  });
  return n;
}

// ---------- entry / exit gate banners ----------
function GateBanners() {
  const gates = useMemo(() => {
    return [
      { id: 'entry', label: 'ENTRY', arrow: '↓', bg: '#059669' },
      { id: 'exit', label: 'EXIT', arrow: '↑', bg: '#dc2626' },
    ].map((g) => {
      const def = ZONE_DEFS.find((d) => d.id === g.id);
      const r = rectToWorld(def.rect);
      return { ...g, cx: r.cx, cz: r.cz - r.d / 2 - 0.4 };
    });
  }, []);
  return (
    <group>
      {gates.map((g) => (
        <Html key={g.id} position={[g.cx, 2.4, g.cz]} center distanceFactor={20}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: 0.6,
                color: '#fff',
                background: g.bg,
                borderRadius: 6,
                padding: '2px 8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.45)',
                whiteSpace: 'nowrap',
              }}
            >
              {g.label}
            </span>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: g.bg,
                color: '#fff',
                fontSize: 11,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.45)',
              }}
            >
              {g.arrow}
            </span>
          </div>
        </Html>
      ))}
    </group>
  );
}

// ---------- static store shell ----------
function StoreShell({ dark, merged }) {
  const wallColor = dark ? '#2b3a55' : '#cbd5e1';
  const floorColor = dark ? '#101a30' : '#eef2f7';
  const shelfColor = dark ? '#3b4c6b' : '#e2e8f0';
  const shelfEdge = dark ? '#5b7195' : '#94a3b8';
  const H = 0.5;
  const T = 0.2;
  const entry = ZONE_DEFS.find((z) => z.id === 'entry');
  const exit = ZONE_DEFS.find((z) => z.id === 'exit');
  const [eX0] = [mapToWorld(entry.rect[0], 0)[0]];
  const [eX1] = [mapToWorld(entry.rect[2], 0)[0]];
  const [xX0] = [mapToWorld(exit.rect[0], 0)[0]];
  const [xX1] = [mapToWorld(exit.rect[2], 0)[0]];
  const fz = -WORLD_D / 2;
  const bz = WORLD_D / 2;
  // Front wall segments leaving door gaps.
  const segs = useMemo(() => {
    const edges = [-WORLD_W / 2, eX0, eX1, xX0, xX1, WORLD_W / 2].sort((a, b) => a - b);
    const out = [];
    for (let i = 0; i < edges.length; i += 2) {
      const a = edges[i];
      const b = edges[i + 1];
      if (b - a > 0.3) out.push({ cx: (a + b) / 2, w: b - a });
    }
    return out;
  }, [eX0, eX1, xX0, xX1]);

  return (
    <group>
      {/* floor */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD_W, WORLD_D]} />
        <meshStandardMaterial color={floorColor} roughness={0.95} />
      </mesh>
      <gridHelper args={[WORLD_W, 20, dark ? '#1e293b' : '#cbd5e1', dark ? '#1e293b' : '#e2e8f0']} position={[0, 0.005, 0]} />

      {/* back + side walls */}
      <mesh position={[0, H / 2, bz]}>
        <boxGeometry args={[WORLD_W, H, T]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[-WORLD_W / 2, H / 2, 0]}>
        <boxGeometry args={[T, H, WORLD_D]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[WORLD_W / 2, H / 2, 0]}>
        <boxGeometry args={[T, H, WORLD_D]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      {/* front wall with entry/exit gaps */}
      {segs.map((s, i) => (
        <mesh key={i} position={[s.cx, H / 2, fz]}>
          <boxGeometry args={[s.w, H, T]} />
          <meshStandardMaterial color={wallColor} roughness={0.9} />
        </mesh>
      ))}

      {/* shelves per shelf zone */}
      {merged.filter((z) => isShelfZone(z.id)).map((z) => (
        <group key={z.id}>
          {shelvesForZone(ZONE_DEFS.find((d) => d.id === z.id)).map((s, si) => (
            <group key={si}>
              <mesh position={[s.cx, 0.55, s.cz]}>
                <boxGeometry args={[s.w, 1.1, s.d]} />
                <meshStandardMaterial color={shelfColor} roughness={0.8} />
              </mesh>
              {/* shelf top edge highlight */}
              <mesh position={[s.cx, 1.11, s.cz]}>
                <boxGeometry args={[s.w, 0.04, s.d]} />
                <meshStandardMaterial color={shelfEdge} roughness={0.6} />
              </mesh>
              {/* deterministic product blocks on top */}
              {[0.15, 0.38, 0.62, 0.85].map((f, k) => (
                <mesh key={k} position={[s.cx - s.w / 2 + f * s.w, 1.1 + 0.09 + 0.03 * ((k * 7 + si) % 3), s.cz]}>
                  <boxGeometry args={[Math.max(0.22, s.w * 0.09), 0.18 + 0.06 * ((k * 7 + si) % 3), Math.max(0.16, s.d * 0.6)]} />
                  <meshStandardMaterial color={PRODUCT_COLORS[(si * 4 + k) % PRODUCT_COLORS.length]} roughness={0.7} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* checkout counters */}
      {(() => {
        const cz = ZONE_DEFS.find((d) => d.id === 'checkout');
        const r = rectToWorld(cz.rect);
        return [0.22, 0.5, 0.78].map((f, i) => (
          <group key={i} position={[r.cx - r.w / 2 + f * r.w, 0, r.cz]}>
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[1.6, 0.9, 0.7]} />
              <meshStandardMaterial color={dark ? '#1e293b' : '#0f172a'} roughness={0.7} />
            </mesh>
            <mesh position={[0.4, 1.05, 0]}>
              <boxGeometry args={[0.4, 0.3, 0.4]} />
              <meshStandardMaterial color="#10b981" roughness={0.6} />
            </mesh>
          </group>
        ));
      })()}

      {/* entry / exit mats */}
      {[entry, exit].map((z) => {
        const r = rectToWorld(z.rect);
        return (
          <mesh key={z.id} position={[r.cx, 0.012, r.cz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[r.w * 0.9, r.d * 0.9]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.25} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

// ---------- main panel ----------
export default function Store3DView({
  zones,
  people,
  trails,
  selectedId,
  onSelectPerson,
  connected,
  dark,
  fallbackZones,
}) {
  const [view, setView] = useState('3d');
  const [cameraMode, setCameraMode] = useState('top'); // Default: 'top' (Upside View)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsRef = useRef(null);
  const merged = useMemo(() => mergeZones(zones?.length ? zones : fallbackZones), [zones, fallbackZones]);
  const personsOnly = useMemo(
    () =>
      (people || []).filter(
        (p) =>
          (p.class_id === undefined || p.class_id === 0) &&
          (p.class_name === undefined || p.class_name === null || String(p.class_name).toLowerCase() === 'person')
      ),
    [people]
  );

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none bg-white dark:bg-[#0a1730] flex flex-col h-screen w-screen p-4'
          : 'relative bg-white dark:bg-[#0a1730] rounded-2xl overflow-hidden border border-slate-200 dark:border-blue-900/50 dark:shadow-[0_8px_30px_rgba(2,8,30,0.5)] flex flex-col min-h-[640px] h-[680px]'
      }`}
    >
      {/* Header matching reference design */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-blue-900/40 bg-slate-50/70 dark:bg-slate-900/70">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
            Live Store Floor View
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time upside map tracking & zone occupancy
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 3D Camera Angle Selector (Upside View vs 3D Angled) */}
          {view === '3d' && (
            <div className="p-1 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setCameraMode('top')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  cameraMode === 'top'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500'
                }`}
                title="Direct top-down overhead upside view"
              >
                Upside View (Top)
              </button>
              <button
                type="button"
                onClick={() => setCameraMode('angled')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  cameraMode === 'angled'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-500'
                }`}
                title="3D perspective angled view"
              >
                3D Angled
              </button>
            </div>
          )}

          {/* 3D vs 2D Mode Toggle */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1 shadow-xs">
            <button
              type="button"
              onClick={() => setView('3d')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                view === '3d'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-500'
              }`}
              title="Switch to 3D Digital Twin View"
            >
              3D View
            </button>
            <button
              type="button"
              onClick={() => setView('2d')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                view === '2d'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-500'
              }`}
              title="Switch to 2D Top-Down Blueprint View"
            >
              2D View
            </button>
          </div>

          {/* Occupancy pill badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {personsOnly.length} {personsOnly.length === 1 ? 'person' : 'people'} in store
          </div>

          {/* Fullscreen Expand / Collapse Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors shadow-xs"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body with 3D / 2D Canvas */}
      <div className="relative flex-1 h-full min-h-[560px]">
        {/* Floating 3D Zoom Controls */}
        {view === '3d' && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg">
            <button
              onClick={() => {
                if (controlsRef.current) {
                  controlsRef.current.object.position.multiplyScalar(0.85);
                  controlsRef.current.update();
                }
              }}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              title="Zoom in 3D"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (controlsRef.current) {
                  controlsRef.current.object.position.multiplyScalar(1.15);
                  controlsRef.current.update();
                }
              }}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              title="Zoom out 3D"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (controlsRef.current) {
                  if (cameraMode === 'top') {
                    controlsRef.current.object.position.set(0, 17, 0.001);
                  } else {
                    controlsRef.current.object.position.set(0, 13, 14);
                  }
                  controlsRef.current.target.set(0, 0, 0);
                  controlsRef.current.update();
                }
              }}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              title="Reset 3D camera"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {view === '2d' ? (
          <StoreMapView
            zones={zones}
            people={personsOnly}
            selectedId={selectedId}
            onSelectPerson={onSelectPerson}
            connected={connected}
          />
        ) : (
          <Canvas dpr={[1, 1.75]} camera={{ position: [0, 17, 0.001], fov: 46 }} gl={{ antialias: true }}>
            <color attach="background" args={[dark ? '#070f22' : '#e8eef6']} />
            <ambientLight intensity={1.15} />
            <directionalLight position={[10, 24, 8]} intensity={1.3} />
            <directionalLight position={[-10, 24, -8]} intensity={0.7} />
            <CameraController cameraMode={cameraMode} controlsRef={controlsRef} />
            <StoreShell dark={dark} merged={merged} />
            <GateBanners />
            {merged.map((z) => (
              <ZoneOverlay key={z.id} zone={z} dark={dark} />
            ))}
            {personsOnly.map((p, i) => (
              <PersonMarker
                key={p.id}
                person={p}
                selected={String(selectedId) === String(p.id)}
                dark={dark}
                labelLift={(i % 3) * 0.35}
                onSelect={onSelectPerson}
              />
            ))}
            <OrbitControls
              ref={controlsRef}
              makeDefault
              enableDamping
              dampingFactor={0.12}
              minDistance={4}
              maxDistance={35}
              maxPolarAngle={Math.PI / 2.05}
              target={[0, 0, 0]}
            />
          </Canvas>
        )}

        {/* Connection status overlay */}
        {!connected && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-[1px] pointer-events-none z-20">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2">
              CCTV detection unavailable — upload a video and start processing
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

