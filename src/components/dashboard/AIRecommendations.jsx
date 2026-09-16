import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AIRecommendations({ recommendations }) {
  const { toast } = useToast();
  const [activeModal, setActiveModal] = useState(null);

  const urgencyVariants = {
    Critical: 'red',
    High: 'amber',
    Medium: 'emerald',
    Low: 'neutral',
  };

  return (
    <>
      <Card
        title="AI Recommendations"
        subtitle="Automated cross-domain store intelligence & prescriptive actions"
        action={
          <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            AI Engine Active
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-slate-800">{rec.title}</h4>
                  <Badge variant={urgencyVariants[rec.urgency] || 'neutral'} size="sm">
                    {rec.urgency}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{rec.description}</p>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => setActiveModal(rec)}
              >
                {rec.actionText}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Modal */}
      {activeModal && (
        <Modal
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          title={`Execute Recommendation: ${activeModal.title}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
              <p className="font-semibold mb-1">AI Intelligence Correlation:</p>
              <p>{activeModal.description}</p>
            </div>
            <p className="text-xs text-slate-600">
              Confirm action dispatch to store management workflow. This will trigger appropriate inventory, task, or staff notifications.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                onClick={() => {
                  toast.success('Action Dispatched', `Action "${activeModal.actionText}" triggered successfully.`);
                  setActiveModal(null);
                }}
              >
                Confirm & Dispatch
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
