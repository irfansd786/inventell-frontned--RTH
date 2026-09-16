// Tiny pub/sub store so the global Topbar can show the Computer Vision
// engine status while the user is on /monitoring — without prop drilling.
// Only real backend/video values are published; never simulated.

import { useSyncExternalStore } from 'react';

let snapshot = {
  connected: false,
  processing: false,
  progress: 0,
  fps: null,
  resolution: null,
  engine: 'YOLOv8 + ByteTrack',
};

const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function setCvStatus(partial) {
  snapshot = { ...snapshot, ...partial };
  emit();
}

export function resetCvStatus() {
  snapshot = {
    connected: false,
    processing: false,
    progress: 0,
    fps: null,
    resolution: null,
    engine: 'YOLOv8 + ByteTrack',
  };
  emit();
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getSnapshot() {
  return snapshot;
}

export function useCvStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
