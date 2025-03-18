
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, addDays } from 'date-fns';
import ShiftCell from './ShiftCell';
import { Employee, Shift } from './types';

interface RosterTableProps {
  weekDays: Date[];
  employees: Employee[];
  shifts: Shift[];
  availabilityView: boolean;
  getShiftsForDayAndEmployee: (day: Date, employeeId: string) => Shift[];
  isEmployeeAvailable: (employeeId: string, day: Date) => boolean;
  openAddShiftDialog: (day: Date, employee: Employee) => void;
  removeShift: (id: string) => void;
}

const RosterTable: React.FC<RosterTableProps> = ({
  weekDays,
  employees,
  shifts,
  availabilityView,
  getShiftsForDayAndEmployee,
  isEmployeeAvailable,
  openAddShiftDialog,
  removeShift
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header row with days */}
        <div className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-border">
          <div className="px-4 py-3 text-sm font-medium text-muted-foreground">
            Staff
          </div>
          {weekDays.map((day) => (
            <div
              key={format(day, 'yyyy-MM-dd')}
              className="px-2 py-3 text-center text-sm"
            >
              <div className="font-medium">{format(day, 'EEE')}</div>
              <div className="text-xs text-muted-foreground">{format(day, 'MMM d')}</div>
            </div>
          ))}
        </div>
        
        {/* Employee rows */}
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-border hover:bg-accent/5"
          >
            <div className="px-4 py-4 flex items-center gap-3">
              <Avatar>
                <AvatarImage src={employee.avatarUrl} />
                <AvatarFallback className={employee.color}>
                  {employee.initials}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium truncate">{employee.name}</span>
            </div>
            
            {weekDays.map((day) => {
              const dayShifts = getShiftsForDayAndEmployee(day, employee.id);
              const employeeAvailable = isEmployeeAvailable(employee.id, day);
              
              return (
                <ShiftCell
                  key={format(day, 'yyyy-MM-dd')}
                  day={day}
                  employee={employee}
                  shifts={dayShifts}
                  availabilityView={availabilityView}
                  isAvailable={employeeAvailable}
                  openAddShiftDialog={openAddShiftDialog}
                  removeShift={removeShift}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RosterTable;
