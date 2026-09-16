import React from 'react';
import { CheckCircle2, Clock, Sparkles, Cpu, Layers, Rocket, Shield, Video, Bot } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

export default function FutureRoadmap() {
  const roadmapPhases = [
    {
      phase: 'PHASE 1',
      title: 'Store Intelligence Foundation',
      status: 'Completed',
      color: 'emerald',
      items: [
        'CCTV Feed Simulation & Stream Grid',
        'Command Center Dashboard',
        'Store Monitor View & Controls'
      ]
    },
    {
      phase: 'PHASE 2',
      title: 'Customer & Shelf Analytics',
      status: 'Completed',
      color: 'emerald',
      items: [
        'CV Footfall & Dwell Time Tracking',
        'Interactive Zone Dwell Heatmap',
        'Queue Analytics & Wait Thresholds',
        'Shelf Intelligence & Out-of-Stock Detection'
      ]
    },
    {
      phase: 'PHASE 3',
      title: 'Sales, Inventory & Warehouse Operations',
      status: 'Completed',
      color: 'emerald',
      items: [
        'Billing POS & Revenue Analytics',
        'Master Product Registry & Stock Health',
        'Low Stock Risk Priority & Reorder Triggers',
        'Demand Forecasting Engine',
        'Warehouse Fulfillment (Allocation, Picking, Packing, Dispatch)',
        'Stock Transfers & Supplier Management'
      ]
    },
    {
      phase: 'PHASE 4',
      title: 'AI Decision Support & Final Control Layer',
      status: 'Current Release',
      color: 'emerald',
      items: [
        'Retail Intelligence Analytics',
        'Enterprise Risk Matrix & Modal Inspector',
        'AI Prescriptive Insights & Confidence Ratings',
        'Incident & Alert Center',
        'Operational Exceptions Tracker',
        'Management Action Approval Workflow',
        'What-If Scenario Decision Simulator',
        'Report Center & Export Preview Canvas',
        'Financial Telemetry & Staff Operations'
      ]
    },
    {
      phase: 'NEXT GEN',
      title: 'Future Product Roadmap',
      status: 'Planned',
      color: 'emerald',
      items: [
        'Live WebRTC CCTV Video Stream Server',
        'Real-time POS Hardware Protocol Integration',
        'Deep Learning LSTM Demand Forecasting',
        'Edge AI Camera Object Detection Microservices',
        'Multi-Store Enterprise Aggregation',
        'Multi-Warehouse Multi-Echelon Routing',
        'Autonomous Robotic Replenishment Triggers',
        'LLM Agentic Natural Language Command Console',
        'Mobile Manager Android / iOS App'
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Future Intelligence & Platform Roadmap"
        subtitle="Evolution timeline of INVINTELL — from Store Computer Vision to Next-Gen Agentic Retail AI."
      />

      <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
        {roadmapPhases.map((rp, idx) => {
          const isCurrent = rp.status === 'Current Release';
          const isPlanned = rp.status === 'Planned';

          return (
            <div key={idx} className="relative group">
              {/* Timeline Icon Node */}
              <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                isPlanned
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {isPlanned ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>

              {/* Card Container */}
              <div className={`bg-white border rounded-2xl p-5 shadow-2xs transition-all ${
                isCurrent
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isPlanned ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {rp.phase}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-1">{rp.title}</h3>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    isCurrent
                      ? 'bg-emerald-500 text-white shadow-2xs'
                      : isPlanned
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {rp.status}
                  </span>
                </div>

                <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {rp.items.map((item, iIdx) => (
                    <li key={iIdx} className="flex items-center gap-2 text-slate-700 font-medium p-2 bg-slate-50 rounded-lg">
                      <span className={`w-2 h-2 rounded-full ${isPlanned ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
                      <span>{item}</span>
                      {isPlanned && (
                        <span className="ml-auto text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase">
                          Planned
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
