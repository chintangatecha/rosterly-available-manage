
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { format, addDays, startOfWeek, subWeeks, addWeeks, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  const fetchShifts = async () => {
    if (!user) {
      setError("Please log in to view your shifts");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const startDate = format(currentWeekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
      
      const { data, error: supabaseError } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      // Transform shifts data
      const formattedShifts: Shift[] = (data || []).map(shift => ({
        id: shift.id,
        date: parseISO(shift.date),
        startTime: shift.start_time.slice(0, 5),
        endTime: shift.end_time.slice(0, 5),
      }));
      
      setShifts(formattedShifts);
    } catch (err: any) {
      setError(err.message || 'Failed to load shifts');
      console.error('Error fetching shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch shifts when the component mounts or the week changes
  useEffect(() => {
    fetchShifts();
  }, [user, currentWeekStart]);

  const previousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const getShiftsForDay = (day: Date) => {
    return shifts.filter(shift => 
      format(shift.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
  };

  const handleRefresh = () => {
    fetchShifts();
    toast.info("Refreshing shifts data...");
  };

  return (
    <AnimatedTransition className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center mb-2 text-primary bg-primary/10 p-2 rounded-lg">
          <Calendar size={24} />
        </div>
        <h1 className="text-3xl font-bold mb-2">My Shifts</h1>
        <p className="text-muted-foreground">View your upcoming work schedule</p>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Weekly Schedule</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={previousWeek}>
                <ChevronLeft size={16} />
              </Button>
              <span className="text-sm font-medium">
                {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
              </span>
              <Button variant="outline" size="sm" onClick={nextWeek}>
                <ChevronRight size={16} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} title="Refresh shifts">
                <RefreshCw size={16} />
              </Button>
            </div>
          </div>
          <CardDescription>
            Your assigned shifts for the selected week
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="p-6 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={fetchShifts} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day, i) => (
                <div key={i} className="border rounded-lg">
                  <div className="text-center py-2 font-medium rounded-t-lg bg-accent/50">
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-xs text-muted-foreground mt-1">{format(day, 'MMM d')}</div>
                  </div>
                  <div className="p-3 min-h-[120px]">
                    <Skeleton className="w-full h-16" />
                  </div>
                </div>
              ))}
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
