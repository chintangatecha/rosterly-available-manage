import React from 'react';
import { Employee, Shift, AvailabilityRecord } from './types';
import EmployeeRosterRow from './EmployeeRosterRow';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileEmployeeRoster from './MobileEmployeeRoster';

interface CombinedRosterTableProps {
  weekDays: Date[];
  employees: Employee[];
  shifts: Shift[];
  employeeAvailability: AvailabilityRecord[];
  getShiftsForDayAndEmployee: (day: Date, employeeId: string) => Shift[];
  isEmployeeAvailable: (employeeId: string, day: Date) => boolean;
  openAddShiftDialog: (day: Date, employee: Employee) => void;
  removeShift: (id: string) => void;
  isManager: boolean;
  onEmployeeUpdated: () => void;
}

const CombinedRosterTable: React.FC<CombinedRosterTableProps> = ({
  weekDays,
  employees,
  shifts,
  employeeAvailability,
  getShiftsForDayAndEmployee,
  isEmployeeAvailable,
  openAddShiftDialog,
  removeShift,
  isManager,
  onEmployeeUpdated
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4">
        {employees.map((employee) => (
          <MobileEmployeeRoster
            key={employee.id}
            employee={employee}
            weekDays={weekDays}
            employeeAvailability={employeeAvailability}
            getShiftsForDayAndEmployee={getShiftsForDayAndEmployee}
            isEmployeeAvailable={isEmployeeAvailable}
            openAddShiftDialog={openAddShiftDialog}
            removeShift={removeShift}
            isManager={isManager}
            onEmployeeUpdated={onEmployeeUpdated}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {employees.map((employee) => (
        <EmployeeRosterRow
          key={employee.id}
          employee={employee}
          weekDays={weekDays}
          employeeAvailability={employeeAvailability}
          shifts={shifts}
          getShiftsForDayAndEmployee={getShiftsForDayAndEmployee}
          isEmployeeAvailable={isEmployeeAvailable}
          openAddShiftDialog={openAddShiftDialog}
          removeShift={removeShift}
          isManager={isManager}
          onEmployeeUpdated={onEmployeeUpdated}
        />
      ))}
    </div>
  );
};

export default CombinedRosterTable;
