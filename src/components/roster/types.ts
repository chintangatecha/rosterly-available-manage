
import { Dispatch, SetStateAction } from 'react';

export interface Employee {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string;
  color: string;
}

export interface Shift {
  id: string;
  employeeId: string;
  day: Date;
  startTime: string;
  endTime: string;
}

export interface AvailabilityRecord {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface ProfileRecord {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
}

export interface ShiftRecord {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  created_by: string;
}

export interface ShiftFormData {
  startTime: string;
  endTime: string;
}

export const colorClasses = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-emerald-500',
];

export interface WeekNavigationProps {
  currentWeekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export interface RosterHeaderProps {
  currentWeekStart: Date;
  previousWeek: () => void;
  nextWeek: () => void;
}

export interface ShiftCellProps {
  day: Date;
  employee: Employee;
  shifts: Shift[];
  availabilityView: boolean;
  isAvailable: boolean;
  openAddShiftDialog: (day: Date, employee: Employee) => void;
  removeShift: (id: string) => void;
}

export interface AddShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: Date | null;
  selectedEmployee: Employee | null;
  shiftForm: ShiftFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isEmployeeAvailable: boolean;
}
