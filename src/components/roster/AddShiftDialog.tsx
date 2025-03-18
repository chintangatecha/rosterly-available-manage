
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AddShiftDialogProps } from './types';

const AddShiftDialog: React.FC<AddShiftDialogProps> = ({
  isOpen,
  onClose,
  selectedDay,
  selectedEmployee,
  shiftForm,
  onChange,
  onSubmit,
  isEmployeeAvailable
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Shift</DialogTitle>
          <DialogDescription>
            {selectedEmployee && selectedDay && (
              <>Add a shift for {selectedEmployee.name} on {format(selectedDay, 'EEEE, MMMM d')}</>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={shiftForm.startTime}
                onChange={onChange}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={shiftForm.endTime}
                onChange={onChange}
              />
            </div>
          </div>
          
          {selectedDay && selectedEmployee && !isEmployeeAvailable && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              Warning: This employee has not indicated availability for this day.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit}>
            Add Shift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddShiftDialog;
