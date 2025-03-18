
import React, { useState } from 'react';
import { format, addWeeks, subWeeks, startOfWeek } from 'date-fns';
import { Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedTransition from './AnimatedTransition';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import WeekView from './availability/WeekView';
import DailyView from './availability/DailyView';

const EmployeeAvailability: React.FC = () => {
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 1 }); // Start week on Monday
  });
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const previousWeek = () => {
    setSelectedWeekStart(prevWeek => {
      const newWeekStart = subWeeks(prevWeek, 1);
      console.log('Moving to previous week:', format(newWeekStart, 'yyyy-MM-dd'));
      return newWeekStart;
    });
  };

  const nextWeek = () => {
    setSelectedWeekStart(prevWeek => {
      const newWeekStart = addWeeks(prevWeek, 1);
      console.log('Moving to next week:', format(newWeekStart, 'yyyy-MM-dd'));
      return newWeekStart;
    });
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <AnimatedTransition className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center mb-2 text-primary bg-primary/10 p-2 rounded-lg">
          <Calendar size={24} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Submit Your Availability</h1>
        <p className="text-muted-foreground">Set your available hours for the upcoming schedule</p>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="space-y-4">
          <WeekView 
            currentWeekStart={selectedWeekStart}
            onPreviousWeek={previousWeek}
            onNextWeek={nextWeek}
          />
        </TabsContent>
        
        <TabsContent value="daily" className="space-y-4">
          <DailyView />
        </TabsContent>
      </Tabs>
    </AnimatedTransition>
  );
};

export default EmployeeAvailability;
