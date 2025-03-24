
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { format, addDays, startOfWeek, subWeeks, addWeeks, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AnimatedTransition from './AnimatedTransition';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Shift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
}

const EmployeeShifts = () => {
  // Initialize with Monday as the start of the week
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Get the current date
    const today = new Date();
    // Get the start of the week (Monday)
    return startOfWeek(today, { weekStartsOn: 1 });
  });
  
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Create an array of the 7 days of the week starting from currentWeekStart
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    if (user) {
      fetchShifts();
    }
  }, [currentWeekStart, user]);

  const fetchShifts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const startDate = format(currentWeekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
      
      console.log(`Fetching shifts from ${startDate} to ${endDate}`);
      
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);
      
      if (error) throw error;
      
      // Transform shifts data
      const formattedShifts: Shift[] = (data || []).map(shift => ({
        id: shift.id,
        date: parseISO(shift.date),
        startTime: shift.start_time.slice(0, 5),
        endTime: shift.end_time.slice(0, 5),
      }));
      
      setShifts(formattedShifts);
      console.log('Shifts loaded:', formattedShifts.length);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load shifts');
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const previousWeek = () => {
    setCurrentWeekStart(prevWeekStart => {
      const newWeekStart = subWeeks(prevWeekStart, 1);
      console.log('Moving to previous week:', format(newWeekStart, 'yyyy-MM-dd'));
      return newWeekStart;
    });
  };

  const nextWeek = () => {
    setCurrentWeekStart(prevWeekStart => {
      const newWeekStart = addWeeks(prevWeekStart, 1);
      console.log('Moving to next week:', format(newWeekStart, 'yyyy-MM-dd'));
      return newWeekStart;
    });
  };

  const getShiftsForDay = (day: Date) => {
    return shifts.filter(shift => 
      format(shift.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
  };

  return (
    <AnimatedTransition className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center mb-2 p-2 rounded-lg">
          <img 
            src="/images/eroster-icon.svg" 
            alt="eRoster Logo" 
            width="32" 
            height="32" 
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold mb-2"><span className="text-primary">e</span>Roster Shifts</h1>
        <p className="text-muted-foreground">View your upcoming work schedule</p>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Weekly Schedule</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={previousWeek}>
                <ChevronLeft size={16} className="mr-1" />
                Previous Week
              </Button>
              <span className="text-sm font-medium">
                {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
              </span>
              <Button variant="outline" size="sm" onClick={nextWeek}>
                Next Week
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Your assigned shifts for the selected week
          </CardDescription>
          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm" onClick={fetchShifts} className="gap-2">
              <RefreshCw size={14} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : shifts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No shifts scheduled for this week</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map(day => {
                const dayShifts = getShiftsForDay(day);
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <div 
                    key={format(day, 'yyyy-MM-dd')}
                    className={`border rounded-lg ${isToday ? 'border-primary' : 'border-border'}`}
                  >
                    <div className={`text-center py-2 font-medium rounded-t-lg ${isToday ? 'bg-primary/10 text-primary' : 'bg-accent/50'}`}>
                      <div>{format(day, 'EEE')}</div>
                      <div className="text-xs text-muted-foreground mt-1">{format(day, 'MMM d')}</div>
                    </div>
                    
                    <div className="p-3 min-h-[120px]">
                      {dayShifts.length > 0 ? (
                        <div className="space-y-2">
                          {dayShifts.map(shift => (
                            <motion.div
                              key={shift.id}
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-sm"
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <Clock size={14} className="text-primary" />
                                <span className="font-medium">
                                  {shift.startTime} - {shift.endTime}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-xs text-muted-foreground">No shifts</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedTransition>
  );
};

export default EmployeeShifts;
