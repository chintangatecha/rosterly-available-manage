
import React from 'react';
import { Calendar } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import WeekNavigation from './WeekNavigation';
import { RosterHeaderProps } from './types';

const RosterHeader: React.FC<RosterHeaderProps> = ({
  currentWeekStart,
  previousWeek,
  nextWeek
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <CardTitle>Weekly Roster</CardTitle>
        <WeekNavigation
          currentWeekStart={currentWeekStart}
          onPreviousWeek={previousWeek}
          onNextWeek={nextWeek}
        />
      </div>
      <CardDescription>
        Click + to add shifts for employees
      </CardDescription>
    </>
  );
};

export default RosterHeader;
