import React, { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Employee, AvailabilityRecord, Shift } from './types';
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';
import { X, Plus, Edit2 } from 'lucide-react';
import EditEmployeeDialog from './EditEmployeeDialog';
import { Badge } from '@/components/ui/badge';

interface MobileEmployeeRosterProps {
  employee: Employee;
  weekDays: Date[];
  employeeAvailability: AvailabilityRecord[];
  getShiftsForDayAndEmployee: (day: Date, employeeId: string) => Shift[];
  isEmployeeAvailable: (employeeId: string, day: Date) => boolean;
  openAddShiftDialog: (day: Date, employee: Employee) => void;
  removeShift: (id: string) => void;
  isManager: boolean;
  onEmployeeUpdated: () => void;
}

const MobileEmployeeRoster: React.FC<MobileEmployeeRosterProps> = ({
  employee,
  weekDays,
  employeeAvailability,
  getShiftsForDayAndEmployee,
  isEmployeeAvailable,
  openAddShiftDialog,
  removeShift,
  isManager,
  onEmployeeUpdated
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const renderContent = () => (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-3 border-b border-border bg-muted">
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
      
      <div className="grid grid-cols-7 gap-1 p-2">
        {weekDays.map((day) => {
          const dayShifts = getShiftsForDayAndEmployee(day, employee.id);
          const isAvailable = isEmployeeAvailable(employee.id, day);
          const formattedDate = format(day, 'yyyy-MM-dd');
          
          // Find the availability records for this employee and day
          const availabilityRecords = employeeAvailability.filter(
            a => a.user_id === employee.id && a.date === formattedDate
          );
          
          return (
            <Drawer key={format(day, 'yyyy-MM-dd')}>
              <DrawerTrigger asChild>
                <div className="cursor-pointer">
                  <div className={`p-1 text-center rounded-md mb-1 text-xs ${
                    isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <div>{format(day, 'EEE')}</div>
                    <div>{format(day, 'd')}</div>
                  </div>
                  <div className={`p-1 text-center rounded-md text-xs ${
                    dayShifts.length > 0 ? 'bg-primary/10 text-primary' : 'bg-secondary'
                  }`}>
                    {dayShifts.length > 0 ? `${dayShifts.length} shift${dayShifts.length > 1 ? 's' : ''}` : 'No shifts'}
                  </div>
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
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium mb-2">Availability</h5>
                    <div className={`p-3 rounded-md ${
                      isAvailable ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {isAvailable ? (
                        <div>
                          <div className="font-medium mb-1">Available</div>
                          {availabilityRecords.map((record, idx) => (
                            <div key={idx} className="text-sm">
                              {record.start_time.slice(0, 5)} - {record.end_time.slice(0, 5)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="font-medium">Unavailable</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium mb-2">Shifts</h5>
                    <div className="space-y-2">
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
                      
                      {dayShifts.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center p-3">
                          No shifts scheduled
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          openAddShiftDialog(day, employee);
                        }}
                      >
                        <Plus size={16} className="mr-1" />
                        Add Shift
                      </Button>
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
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

export default MobileEmployeeRoster;
