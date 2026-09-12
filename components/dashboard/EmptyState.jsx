'use strict';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

export default function EmptyState({ icon: Icon, title, description, action, actionLabel, actionIcon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-20 px-8 space-y-4"
    >
      {Icon && (
        <div className="w-20 h-20 rounded-3xl bg-slate-800/60 border border-white/5 flex items-center justify-center mb-2">
          <Icon className="w-10 h-10 text-slate-600" />
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-300">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>}
      {action && (
        <div className="pt-2">
          <Button variant="primary" size="md" icon={actionIcon} onClick={action}>
            {actionLabel}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
