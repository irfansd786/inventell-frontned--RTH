// Shared 3D store geometry + video→store coordinate mapping.
//
// Backend map coordinates are percent: x 0..100, y 0..70 (SVG viewBox).
// Foot point (bottom-center of YOLO bbox) is computed server-side
// (app/cv/mapper.py); React only visualizes backend data — never invents
// positions.
//
// World units: store floor is WORLD_W x WORLD_D centered at origin.
// mapToWorld converts backend map coords → three.js [x, 0, z].

export const WORLD_W = 20;
export const WORLD_D = 14;

export function mapToWorld(x, y) {
  const nx = Math.max(0, Math.min(100, Number(x) || 0)) / 100;
  const ny = Math.max(0, Math.min(70, Number(y) || 0)) / 70;
  return [(nx - 0.5) * WORLD_W, 0, (ny - 0.5) * WORLD_D];
}

// Fixed zone footprints in map-percent coords (mirror backend ZONES).
// rect: [x0, y0, x1, y1] in the 0..100 / 0..70 space.
export const ZONE_DEFS = [
  { id: 'entry', name: 'ENTRY', rect: [2, 1, 24, 8], color: '#3b82f6' },
  { id: 'exit', name: 'EXIT', rect: [76, 1, 98, 8], color: '#3b82f6' },
  { id: 'beverages', name: 'BEVERAGES', rect: [5, 12, 35, 30], color: '#10b981' },
  { id: 'snacks', name: 'SNACKS & FOOD', rect: [40, 12, 70, 30], color: '#f59e0b' },
  { id: 'grocery', name: 'GROCERY', rect: [5, 34, 35, 52], color: '#10b981' },
  { id: 'personal', name: 'PERSONAL CARE', rect: [40, 34, 70, 52], color: '#8b5cf6' },
  { id: 'checkout', name: 'CHECKOUT', rect: [10, 56, 65, 67], color: '#ef4444' },
];

const SHELF_ZONE_IDS = new Set(['beverages', 'snacks', 'grocery', 'personal']);

// Convert a percent rect → world { cx, cz, w, d }.
export function rectToWorld(rect) {
  const [x0, y0, x1, y1] = rect;
  const [ax, , az] = mapToWorld(x0, y0);
  const [bx, , bz] = mapToWorld(x1, y1);
  return {
    cx: (ax + bx) / 2,
    cz: (az + bz) / 2,
    w: Math.abs(bx - ax),
    d: Math.abs(bz - az),
  };
}

// Shelf rows inside a shelf zone (fractions of the zone footprint).
// Returns world-space shelf descriptors { cx, cz, w, d }.
export function shelvesForZone(zoneDef) {
  const z = rectToWorld(zoneDef.rect);
  const rows = [];
  // Two parallel shelf rows along the zone width, inset from edges.
  const rowD = Math.max(0.28, z.d * 0.16);
  const offsets = [-0.22, 0.22];
  for (const off of offsets) {
    rows.push({
      cx: z.cx,
      cz: z.cz + off * z.d,
      w: Math.max(0.6, z.w * 0.86),
      d: rowD,
    });
  }
  return rows;
}

export function isShelfZone(id) {
  return SHELF_ZONE_IDS.has(id);
}

// Merge backend live zone data (count/status) onto fixed geometry.
export function mergeZones(liveZones) {
  const byId = new Map((liveZones || []).map((z) => [z.id, z]));
  return ZONE_DEFS.map((def) => {
    const live = byId.get(def.id);
    return {
      ...def,
      ...rectToWorld(def.rect),
      count: live?.count ?? 0,
      status: live?.status ?? (live?.count > 0 ? 'normal' : 'empty'),
    };
  });
}

export function zoneStatusColor(status, dark) {
  switch (status) {
    case 'critical':
    case 'crowded':
      return dark ? '#ef4444' : '#dc2626';
    case 'busy':
      return '#059669';
    case 'empty':
      return dark ? '#475569' : '#94a3b8';
    default:
      return dark ? '#34d399' : '#10b981';
  }
}
