
import React, { useState, useEffect } from 'react';
import { format, addDays, parseISO, isEqual, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { Calendar, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AnimatedList } from '../AnimatedTransition';

interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
}

const timeSlots = Array.from({ length: 24 }).map((_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

interface AvailabilityCalendarProps {
  currentWeekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  currentWeekStart,
  onPreviousWeek,
  onNextWeek
}) => {
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Generate the days for the current selected week
  const weekDays = Array.from({ length: 7 }).map((_, i) => 
    addDays(currentWeekStart, i)
  );
  
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Format dates for the current week's range
        const startDate = format(currentWeekStart, 'yyyy-MM-dd');
        const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
        
        console.log(`Fetching availability from ${startDate} to ${endDate}`);
        
        const { data, error } = await supabase
          .from('availability')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate);
        
        if (error) throw error;
        
        const transformedData: TimeSlot[] = (data || []).map((item: any) => {
          const date = parseISO(item.date);
          return {
            id: item.id,
            date,
            startTime: item.start_time.slice(0, 5),
            endTime: item.end_time.slice(0, 5),
          };
        });
        
        setAvailability(transformedData);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load availability');
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailability();
  }, [user, currentWeekStart]);
  
  const handleAddTimeSlot = async (dayDate: Date) => {
    if (!user) return;
    
    // Format the date as ISO string for the database
    const formattedDate = format(dayDate, 'yyyy-MM-dd');
    
    const newSlot = {
      user_id: user.id,
      date: formattedDate,
      start_time: '09:00',
      end_time: '17:00',
    };
    
    try {
      const { data, error } = await supabase
        .from('availability')
        .insert(newSlot)
        .select('*')
        .single();
      
      if (error) throw error;
      
      setAvailability([...availability, {
        id: data.id,
        date: parseISO(data.date),
        startTime: data.start_time.slice(0, 5),
        endTime: data.end_time.slice(0, 5),
      }]);
      
      toast.success('Availability added successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add availability');
      console.error('Error adding availability:', error);
    }
  };
  
  const handleTimeChange = async (id: string, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(
      availability.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
    
    const dbField = field === 'startTime' ? 'start_time' : 'end_time';
    
    try {
      const { error } = await supabase
        .from('availability')
        .update({ [dbField]: value })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability');
      console.error('Error updating availability:', error);
    }
  };
  
  const handleDeleteTimeSlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setAvailability(availability.filter((slot) => slot.id !== id));
      toast.success('Availability removed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete availability');
      console.error('Error deleting availability:', error);
    }
  };
  
  const toggleDay = (dayName: string) => {
    setExpandedDay(expandedDay === dayName ? null : dayName);
  };
  
  // Get slots for a specific day
  const getDaySlots = (dayDate: Date) => {
    return availability.filter((slot) => 
      isSameDay(slot.date, dayDate)
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Week Selection</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onPreviousWeek}>
                <ChevronLeft size={16} className="mr-1" />
                Previous Week
              </Button>
              <Button variant="outline" size="sm" onClick={onNextWeek}>
                Next Week
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Currently viewing week starting {format(currentWeekStart, 'PP')}
          </CardDescription>
        </CardHeader>
      </Card>
      
      <AnimatedList className="space-y-4" staggerDelay={0.05}>
        {weekDays.map((dayDate) => {
          const dayName = format(dayDate, 'EEEE'); // e.g., 'Monday'
          const formattedDate = format(dayDate, 'MMM d, yyyy'); // e.g., 'Jan 1, 2023'
          const isExpanded = expandedDay === dayName;
          const daySlots = getDaySlots(dayDate);
          
          return (
            <Card key={dayDate.toString()} className="overflow-hidden">
              <button
                onClick={() => toggleDay(dayName)}
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center">
                  <span className="font-medium">{dayName}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {formattedDate}
                  </span>
                  {daySlots.length > 0 && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {daySlots.length} {daySlots.length === 1 ? 'slot' : 'slots'}
                    </span>
                  )}
                </div>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="pb-4">
                    {daySlots.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>No availability added for {dayName}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleAddTimeSlot(dayDate)}
                        >
                          Add Availability
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center gap-3 bg-accent/5 p-3 rounded-lg"
                          >
                            <div className="text-primary">
                              <Clock size={18} />
                            </div>
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-muted-foreground">From:</label>
                                <Select
                                  value={slot.startTime}
                                  onValueChange={(value) =>
                                    handleTimeChange(slot.id, 'startTime', value)
                                  }
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeSlots.map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-muted-foreground">To:</label>
                                <Select
                                  value={slot.endTime}
                                  onValueChange={(value) =>
                                    handleTimeChange(slot.id, 'endTime', value)
                                  }
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {timeSlots.map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive h-8 w-8 p-0"
                              onClick={() => handleDeleteTimeSlot(slot.id)}
                            >
                              <span className="sr-only">Delete</span>
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => handleAddTimeSlot(dayDate)}
                        >
                          <Plus size={14} className="mr-1" />
                          Add Another Time Slot
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </motion.div>
              )}
            </Card>
          );
        })}
      </AnimatedList>
    </div>
  );
};

export default AvailabilityCalendar;
