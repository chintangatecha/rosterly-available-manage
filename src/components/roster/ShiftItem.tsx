
import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Shift } from './types';

interface ShiftItemProps {
  shift: Shift;
  onRemove: (id: string) => void;
}

const ShiftItem: React.FC<ShiftItemProps> = ({ shift, onRemove }) => {
  return (
    <motion.div
      key={shift.id}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-xs mb-1 relative group"
    >
      <div className="flex items-center gap-1 mb-1">
        <Clock size={12} className="text-primary" />
        <span>
          {shift.startTime} - {shift.endTime}
        </span>
      </div>
      
      <button
        onClick={() => onRemove(shift.id)}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-full p-0.5 hover:bg-background"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

export default ShiftItem;
