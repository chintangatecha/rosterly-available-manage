
import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import WeekNavigation from './WeekNavigation';
import { RosterHeaderProps } from './types';

const RosterHeader: React.FC<RosterHeaderProps> = ({
  currentWeekStart,
  previousWeek,
  nextWeek,
  availabilityView,
  setAvailabilityView
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
        {availabilityView
          ? "Viewing employee availability for this week"
          : "Click + to add shifts for employees"}
      </CardDescription>
      <div className="flex justify-end mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setAvailabilityView(!availabilityView)}
          className="gap-1"
        >
          {availabilityView ? <Calendar size={14} /> : <Users size={14} />}
          {availabilityView ? "Switch to Roster" : "View Availability"}
        </Button>
      </div>
    </>
  );
};

export default RosterHeader;
