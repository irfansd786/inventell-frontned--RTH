import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileVideo } from 'lucide-react';
import { uploadCCTVFootage } from '../../services/monitoringService';

export default function VideoUpload() {
  const [status, setStatus] = useState('Ready'); // Ready, Uploading, Processing, Completed, Error
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatus('Uploading');
    setProgress(10);

    try {
      await uploadCCTVFootage(file, (p) => setProgress(p));
      setStatus('Processing');
      setTimeout(() => {
        setStatus('Completed');
      }, 1200);
    } catch (err) {
      setStatus('Error');
    }
  };

  return (
    <Card
      title="Upload CCTV Footage"
      subtitle="Process custom retail video files via YOLO & ByteTrack engine"
    >
      <div className="space-y-4">
        <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer group">
          <input
            type="file"
            accept=".mp4,.avi,.mov"
            className="sr-only"
            onChange={handleFileChange}
            disabled={status === 'Uploading' || status === 'Processing'}
          />
          <div className="p-3 bg-white rounded-full shadow-xs border border-slate-200 text-slate-500 group-hover:text-emerald-600 group-hover:scale-105 transition-all mb-2">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-800">
            Drag & drop video here or <span className="text-emerald-600 underline">Browse Files</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Supported formats: MP4, AVI, MOV (Max 500MB)</p>
        </label>

        {/* Processing State Indicator */}
        {status !== 'Ready' && (
          <div className="p-3 bg-slate-900 rounded-xl text-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold truncate max-w-[200px]">{fileName}</span>
              </div>
              <Badge
                variant={
                  status === 'Completed'
                    ? 'emerald'
                    : status === 'Error'
                    ? 'rose'
                    : 'amber'
                }
                size="sm"
              >
                {String(status || '').toUpperCase()}
              </Badge>
            </div>

            {(status === 'Uploading' || status === 'Processing') && (
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{status === 'Uploading' ? `Uploading... ${progress}%` : 'Running AI Detection...'}</span>
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                </div>
              </div>
            )}

            {status === 'Completed' && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Video processed! Detections extracted into store timeline.
              </p>
            )}

            {status === 'Error' && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Failed to process video file. Please try again.
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
