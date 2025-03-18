
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Check, ChevronDown, ChevronUp, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addWeeks, subWeeks, startOfWeek, addDays, parseISO, isEqual } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedTransition, { AnimatedList } from './AnimatedTransition';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface TimeSlot {
  id: string;
  date: Date;
  dayName: string;
  startTime: string;
  endTime: string;
}

interface AvailabilityData {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = Array.from({ length: 24 }).map((_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const EmployeeAvailability: React.FC = () => {
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 1 }); // Start week on Monday
  });
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Generate the days for the current selected week
  const weekDays = Array.from({ length: 7 }).map((_, i) => 
    addDays(selectedWeekStart, i)
  );
  
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Format dates for the current week's range
        const startDate = format(selectedWeekStart, 'yyyy-MM-dd');
        const endDate = format(addDays(selectedWeekStart, 6), 'yyyy-MM-dd');
        
        console.log(`Fetching availability from ${startDate} to ${endDate}`);
        
        const { data, error } = await supabase
          .from('availability')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate);
        
        if (error) throw error;
        
        const transformedData: TimeSlot[] = (data || []).map((item: AvailabilityData) => {
          const date = parseISO(item.date);
          return {
            id: item.id,
            date,
            dayName: format(date, 'EEEE'), // e.g., 'Monday'
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
  }, [user, selectedWeekStart]);
  
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
        dayName: format(parseISO(data.date), 'EEEE'),
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
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  const toggleDay = (dayName: string) => {
    setExpandedDay(expandedDay === dayName ? null : dayName);
  };
  
  // Get slots for a specific day
  const getDaySlots = (dayDate: Date) => {
    return availability.filter((slot) => 
      isEqual(
        new Date(slot.date.getFullYear(), slot.date.getMonth(), slot.date.getDate()),
        new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())
      )
    );
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
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            <TabsTrigger value="daily">Daily View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Week Selection</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={previousWeek}>
                      <ChevronLeft size={16} className="mr-1" />
                      Previous Week
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextWeek}>
                      Next Week
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Currently viewing week starting {format(selectedWeekStart, 'PP')}
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash">
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => handleAddTimeSlot(dayDate)}
                              >
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
          </TabsContent>
          
          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily View (Coming Soon)</CardTitle>
                <CardDescription>
                  This view will allow you to set your availability on a calendar interface.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-12">
                <div className="text-center text-muted-foreground">
                  <Calendar size={48} className="mx-auto mb-4 text-primary/40" />
                  <p>Daily calendar view is coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </AnimatedTransition>
  );
};

export default EmployeeAvailability;
