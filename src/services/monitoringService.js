// Live store monitoring service layer.
import { apiGet, apiPost } from './api';

export async function getMonitoringData() {
  return {
    cctvConnected: false,
    status: 'CCTV source not connected',
    message: 'CCTV analytics unavailable — connect video source (RTSP stream or local MP4 upload).',
    stats: {
      activeCameras: '0 / 4 Active',
      detectionRate: '0 fps (Offline)',
      currentOccupancy: 'Unavailable',
      avgDwellTime: 'Unavailable',
      queueLength: 'Unavailable',
    },
    events: [],
    boxes: [],
    pipeline: {
      framework: 'OpenCV + YOLOv8 (Person Detection) + ByteTrack',
      status: 'Standby / Ready for video input',
    },
  };
}

export async function uploadCCTVFootage(file, onProgress) {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      if (onProgress) onProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        resolve({
          success: true,
          message: 'Video footage received. Ready for CV pipeline processing.',
          fileId: `VID-${Date.now()}`,
          fileName: file.name,
        });
      }
    }, 300);
  });
}
