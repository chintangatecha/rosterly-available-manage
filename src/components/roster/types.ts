
import { Dispatch, SetStateAction } from 'react';
import { Tables } from '@/integrations/supabase/types';

export interface Section {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string;
  color: string;
  jobRole: string | null;
  section?: Section | null;
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
  job_role: string | null;
  section: string | null;
}

export interface ShiftRecord {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  created_by: string;
}

// These interfaces are now replaced by Tables<'roster_versions'> and Tables<'roster_shifts'> from Supabase types

export interface RosterVersion {
  id: string;
  name: string;
  type: 'operational' | 'finalized';
  weekStart: Date;
  isActive: boolean;
  shifts: RosterShift[];
}

export interface RosterShift {
  id: string;
  rosterVersionId: string;
  employeeId: string;
  day: Date;
  startTime: string;
  endTime: string;
}

export interface Section {
  id: string;
  name: string;
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
  currentRosterVersion?: RosterVersion;
  rosterVersions?: RosterVersion[];
  onRosterVersionChange?: (versionId: string) => void;
  onCreateRosterVersion?: (type: 'operational' | 'finalized') => void;
  onCopyRosterVersion?: (sourceVersionId: string, type: 'operational' | 'finalized') => void;
}

export interface ShiftCellProps {
  day: Date;
  employee: Employee;
  shifts: Shift[];
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
