
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, addDays } from 'date-fns';
import ShiftCell from './ShiftCell';
import { Employee, Shift } from './types';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose
} from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        {employees.map((employee) => (
          <MobileEmployeeRow
            key={employee.id}
            employee={employee}
            weekDays={weekDays}
            availabilityView={availabilityView}
            getShiftsForDayAndEmployee={getShiftsForDayAndEmployee}
            isEmployeeAvailable={isEmployeeAvailable}
            openAddShiftDialog={openAddShiftDialog}
            removeShift={removeShift}
          />
        ))}
      </div>
    );
  }

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

// Mobile-specific row component
const MobileEmployeeRow: React.FC<{
  employee: Employee;
  weekDays: Date[];
  availabilityView: boolean;
  getShiftsForDayAndEmployee: (day: Date, employeeId: string) => Shift[];
  isEmployeeAvailable: (employeeId: string, day: Date) => boolean;
  openAddShiftDialog: (day: Date, employee: Employee) => void;
  removeShift: (id: string) => void;
}> = ({
  employee,
  weekDays,
  availabilityView,
  getShiftsForDayAndEmployee,
  isEmployeeAvailable,
  openAddShiftDialog,
  removeShift
}) => {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      <div className="p-3 flex items-center gap-3 border-b border-border">
        <Avatar>
          <AvatarImage src={employee.avatarUrl} />
          <AvatarFallback className={employee.color}>
            {employee.initials}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{employee.name}</span>
      </div>
      
      <div className="grid grid-cols-7 gap-1 p-2">
        {weekDays.map((day) => {
          const dayShifts = getShiftsForDayAndEmployee(day, employee.id);
          const employeeAvailable = isEmployeeAvailable(employee.id, day);
          const dateStr = format(day, 'EEE d');
          
          return (
            <Drawer key={format(day, 'yyyy-MM-dd')}>
              <DrawerTrigger asChild>
                <div
                  className={`p-2 text-center rounded-md cursor-pointer ${
                    availabilityView && !employeeAvailable ? 'bg-red-50/30 text-red-500' : 
                    availabilityView && employeeAvailable ? 'bg-green-50/30 text-green-600' : 
                    dayShifts.length > 0 ? 'bg-primary/10 text-primary' : 'bg-secondary'
                  }`}
                >
                  <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                  <div className="text-xs">{format(day, 'd')}</div>
                  {!availabilityView && dayShifts.length > 0 && (
                    <div className="text-xs mt-1 font-medium">{dayShifts.length}</div>
                  )}
                </div>
              </DrawerTrigger>
              <DrawerContent className="max-h-[90vh]">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">
                      {format(day, 'EEEE, MMMM d')}
                    </h4>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="icon">
                        <X size={18} />
                      </Button>
                    </DrawerClose>
                  </div>
                  
                  <div className="space-y-3">
                    {availabilityView ? (
                      <div className="text-center p-4">
                        {employeeAvailable ? (
                          <div className="text-green-600 font-medium">Available</div>
                        ) : (
                          <div className="text-red-500 font-medium">Unavailable</div>
                        )}
                      </div>
                    ) : (
                      <>
                        {dayShifts.map((shift) => (
                          <div key={shift.id} className="p-3 bg-secondary rounded-md relative">
                            <div className="font-medium">{shift.startTime} - {shift.endTime}</div>
                            <button 
                              onClick={() => removeShift(shift.id)}
                              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            openAddShiftDialog(day, employee);
                          }}
                        >
                          Add Shift
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          );
        })}
      </div>
    </div>
  );
};

export default RosterTable;
