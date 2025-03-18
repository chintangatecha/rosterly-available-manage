
import React from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import ShiftItem from './ShiftItem';
import { ShiftCellProps } from './types';

const ShiftCell: React.FC<ShiftCellProps> = ({
  day,
  employee,
  shifts,
  availabilityView,
  isAvailable,
  openAddShiftDialog,
  removeShift
}) => {
  return (
    <div
      className={`p-2 border-l border-border relative min-h-[120px] ${
        availabilityView && !isAvailable ? 'bg-red-50/30' : 
        availabilityView && isAvailable ? 'bg-green-50/30' : ''
      }`}
    >
      {availabilityView && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {isAvailable ? (
            <span className="text-green-600">Available</span>
          ) : (
            <span className="text-red-500">Unavailable</span>
          )}
        </div>
      )}
      
      {!availabilityView && (
        <>
          <div className="space-y-1">
            {shifts.map((shift) => (
              <ShiftItem key={shift.id} shift={shift} onRemove={removeShift} />
            ))}
            
            <button 
              onClick={() => openAddShiftDialog(day, employee)}
              className="w-full h-8 flex items-center justify-center text-xs text-muted-foreground border border-dashed border-muted-foreground/30 rounded-md hover:bg-accent/5 transition-colors"
            >
              <Plus size={14} className="mr-1" />
              Add Shift
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShiftCell;
