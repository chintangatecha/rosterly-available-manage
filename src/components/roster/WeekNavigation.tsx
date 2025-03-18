
import React from 'react';
import { format, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WeekNavigationProps } from './types';

const WeekNavigation: React.FC<WeekNavigationProps> = ({
  currentWeekStart,
  onPreviousWeek,
  onNextWeek
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onPreviousWeek}>
        <ChevronLeft size={16} />
      </Button>
      <span className="text-sm font-medium">
        {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
      </span>
      <Button variant="outline" size="sm" onClick={onNextWeek}>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

export default WeekNavigation;
