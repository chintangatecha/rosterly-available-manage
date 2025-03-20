
import React from 'react';
import { format, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import AvailabilityCalendar from './AvailabilityCalendar';
import { useIsMobile } from '@/hooks/use-mobile';

interface WeekViewProps {
  currentWeekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentWeekStart,
  onPreviousWeek,
  onNextWeek
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      <AvailabilityCalendar 
        currentWeekStart={currentWeekStart}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
      />
    </div>
  );
};

export default WeekView;
