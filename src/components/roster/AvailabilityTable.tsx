import React from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Employee, AvailabilityRecord } from './types';

interface AvailabilityTableProps {
  weekDays: Date[];
  employees: Employee[];
  employeeAvailability: AvailabilityRecord[];
  isEmployeeAvailable: (employeeId: string, day: Date) => boolean;
}

const AvailabilityTable: React.FC<AvailabilityTableProps> = ({
  weekDays,
  employees,
  employeeAvailability,
  isEmployeeAvailable
}) => {
  return (
    <div className="overflow-x-auto mb-6">
      <div className="min-w-[800px]">
        <h3 className="text-lg font-medium mb-2">Employee Availability</h3>
        
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
              const isAvailable = isEmployeeAvailable(employee.id, day);
              const formattedDate = format(day, 'yyyy-MM-dd');
              
              // Find the availability records for this employee and day
              const availabilityRecords = employeeAvailability.filter(
                a => a.user_id === employee.id && a.date === formattedDate
              );
              
              return (
                <div
                  key={format(day, 'yyyy-MM-dd')}
                  className={`p-2 border-l border-border relative min-h-[80px] ${
                    isAvailable ? 'bg-green-50/30' : 'bg-red-50/30'
                  }`}
                >
                  {isAvailable ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-green-600 font-medium mb-1">Available</span>
                      {availabilityRecords.map((record, idx) => (
                        <div key={idx} className="text-xs text-center">
                          {record.start_time.slice(0, 5)} - {record.end_time.slice(0, 5)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-red-500 font-medium">Unavailable</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityTable;
