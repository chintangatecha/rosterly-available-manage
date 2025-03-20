import React, { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Employee, AvailabilityRecord, Shift } from './types';
import ShiftItem from './ShiftItem';
import { Plus, Edit2 } from 'lucide-react';
import EditEmployeeDialog from './EditEmployeeDialog';
import { Badge } from '@/components/ui/badge';

interface EmployeeRosterRowProps {
  employee: Employee;
  weekDays: Date[];
  employeeAvailability: AvailabilityRecord[];
  shifts: Shift[];
  getShiftsForDayAndEmployee: (day: Date, employeeId: string) => Shift[];
  isEmployeeAvailable: (employeeId: string, day: Date) => boolean;
  openAddShiftDialog: (day: Date, employee: Employee) => void;
  removeShift: (id: string) => void;
  onEmployeeUpdated: () => void;
  isManager: boolean;
}

const EmployeeRosterRow: React.FC<EmployeeRosterRowProps> = ({
  employee,
  weekDays,
  employeeAvailability,
  shifts,
  getShiftsForDayAndEmployee,
  isEmployeeAvailable,
  openAddShiftDialog,
  removeShift,
  onEmployeeUpdated,
  isManager
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const renderContent = () => (
    <div className="mb-6 border rounded-lg overflow-hidden">
      {/* Employee header */}
      <div className="bg-muted p-3 flex items-center gap-3 border-b">
        <Avatar>
          <AvatarImage src={employee.avatarUrl} />
          <AvatarFallback className={employee.color}>
            {employee.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{employee.name}</span>
            {isManager && (
              <button 
                onClick={() => setIsEditDialogOpen(true)}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                title="Edit employee information"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
          {employee.jobRole && (
            <Badge variant="outline" className="text-xs mt-1">
              {employee.jobRole}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Days grid */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div key={format(day, 'yyyy-MM-dd')} className="text-center p-2 border-r last:border-r-0">
            <div className="font-medium text-sm">{format(day, 'EEE')}</div>
            <div className="text-xs text-muted-foreground">{format(day, 'd MMM')}</div>
          </div>
        ))}
      </div>
      
      {/* Availability row */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => {
          const isAvailable = isEmployeeAvailable(employee.id, day);
          const formattedDate = format(day, 'yyyy-MM-dd');
          
          // Find the availability records for this employee and day
          const availabilityRecords = employeeAvailability.filter(
            a => a.user_id === employee.id && a.date === formattedDate
          );
          
          return (
            <div
              key={format(day, 'yyyy-MM-dd')}
              className={`p-2 border-r last:border-r-0 ${
                isAvailable ? 'bg-green-50/30' : 'bg-red-50/30'
              }`}
            >
              {isAvailable ? (
                <div className="text-xs">
                  {availabilityRecords.map((record, idx) => (
                    <div key={idx} className="text-center text-green-600 mb-1">
                      {record.start_time.slice(0, 5)} - {record.end_time.slice(0, 5)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-xs text-red-500">Unavailable</div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Shifts row */}
      <div className="grid grid-cols-7">
        {weekDays.map((day) => {
          const dayShifts = getShiftsForDayAndEmployee(day, employee.id);
          
          return (
            <div key={format(day, 'yyyy-MM-dd')} className="p-2 border-r last:border-r-0 min-h-[80px]">
              <div className="space-y-1">
                {dayShifts.map((shift) => (
                  <ShiftItem key={shift.id} shift={shift} onRemove={removeShift} />
                ))}
                
                <button 
                  onClick={() => openAddShiftDialog(day, employee)}
                  className="w-full h-7 flex items-center justify-center text-xs text-muted-foreground border border-dashed border-muted-foreground/30 rounded-md hover:bg-accent/5 transition-colors"
                >
                  <Plus size={12} className="mr-1" />
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {renderContent()}
      
      {isManager && (
        <EditEmployeeDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          employee={employee}
          onEmployeeUpdated={onEmployeeUpdated}
        />
      )}
    </>
  );
};

export default EmployeeRosterRow;
