import React from 'react';
import { Camera, Eye, ArrowUpRight, Users, UserPlus, UserMinus, Activity } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

export default function LiveStoreCard() {
  const boundingBoxes = [
    { id: '101', x: '25%', y: '40%', width: '70px', height: '100px', label: 'ID:101 (Customer)' },
    { id: '102', x: '50%', y: '30%', width: '65px', height: '95px', label: 'ID:102 (Customer)' },
    { id: '103', x: '75%', y: '55%', width: '70px', height: '105px', label: 'ID:103 (Queue)' },
  ];

  return (
    <Card
      title="Live Store Monitor"
      subtitle="Real-time CCTV vision analytics & tracking"
      action={
        <Link to="/monitoring">
          <Button variant="outline" size="sm" icon={ArrowUpRight}>
            Full Screen Monitor
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Video Simulation Canvas */}
        <div className="lg:col-span-2 relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner group">
          {/* Simulated CCTV Store Layout Background */}
          <div className="absolute inset-0 bg-slate-900 flex flex-col justify-between p-4 opacity-90">
            <div className="grid grid-cols-3 gap-3 h-full border border-slate-800/80 rounded-lg p-3 bg-slate-900/40">
              <div className="border border-slate-800 rounded bg-slate-800/30 flex items-center justify-center text-slate-600 text-xs font-mono">
                Aisle 1 (Beverages)
              </div>
              <div className="border border-slate-800 rounded bg-slate-800/30 flex items-center justify-center text-slate-600 text-xs font-mono">
                Aisle 2 (Snacks)
              </div>
              <div className="border border-slate-800 rounded bg-slate-800/30 flex items-center justify-center text-slate-600 text-xs font-mono">
                Checkout Area
              </div>
            </div>
          </div>

          {/* CCTV Grid scanlines simulation */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.4)_51%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

          {/* Simulated Bounding Boxes Overlay */}
          {boundingBoxes.map((box) => (
            <div
              key={box.id}
              style={{
                left: box.x,
                top: box.y,
                width: box.width,
                height: box.height,
              }}
              className="absolute border-2 border-emerald-400 bg-emerald-500/10 rounded backdrop-blur-[1px] flex flex-col justify-between p-1 transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <div className="bg-emerald-600 text-white text-[9px] font-mono px-1 rounded font-bold w-fit shadow-xs">
                {box.label}
              </div>
              <div className="text-[8px] font-mono text-emerald-300 bg-slate-900/90 px-1 rounded w-fit">
                Confidence: 98%
              </div>
            </div>
          ))}

          {/* Camera Info Overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full shadow-xs">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span>LIVE</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-slate-200 text-xs font-medium rounded-full border border-slate-700/60">
              <Camera className="w-3.5 h-3.5 text-slate-400" />
              <span>Camera 01 - Main Entrance</span>
            </div>
          </div>

          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded backdrop-blur-md border border-slate-800">
            YOLOv8 + ByteTrack active
          </div>
        </div>

        {/* Side Live Telemetry Stats */}
        <div className="flex flex-col justify-between space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200/80 pb-2">
            Live Store Telemetry
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-600">People in Store</span>
              </div>
              <span className="text-lg font-bold text-slate-900">37</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-600">Entry Count</span>
              </div>
              <span className="text-lg font-bold text-slate-900">124</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-md">
                  <UserMinus className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-600">Exit Count</span>
              </div>
              <span className="text-lg font-bold text-slate-900">87</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-600">Occupancy Rate</span>
              </div>
              <span className="text-lg font-bold text-emerald-600">37%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
