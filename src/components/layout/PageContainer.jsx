import React from 'react';
import { motion } from 'framer-motion';

export default function PageContainer({ title, subtitle, action, children, className = 'space-y-6' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={className}
    >
      {(title || subtitle || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            {title && <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>}
            {subtitle && <p className="text-xs lg:text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-3">{action}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
