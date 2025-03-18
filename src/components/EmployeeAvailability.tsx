
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = Array.from({ length: 24 }).map((_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const EmployeeAvailability: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(format(new Date(), 'PP'));
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  
  const handleAddTimeSlot = (day: string) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      day,
      startTime: '09:00',
      endTime: '17:00',
    };
    
    setAvailability([...availability, newSlot]);
  };
  
  const handleTimeChange = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(
      availability.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    );
  };
  
  const handleDeleteTimeSlot = (id: string) => {
    setAvailability(availability.filter((slot) => slot.id !== id));
  };
  
  const handleSubmit = () => {
    // In a real app, this would send data to a backend or Supabase
    console.log('Submitting availability:', availability);
    toast.success('Availability submitted successfully!');
  };
  
  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day);
  };
  
  return (
    <AnimatedTransition className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center mb-2 text-primary bg-primary/10 p-2 rounded-lg">
          <Calendar size={24} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Submit Your Availability</h1>
        <p className="text-muted-foreground">Set your available hours for the upcoming schedule</p>
      </div>
      
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
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar size={16} />
                  Change Week
                </Button>
              </CardTitle>
              <CardDescription>
                Currently viewing week starting {selectedWeek}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <AnimatedList className="space-y-4" staggerDelay={0.05}>
            {days.map((day) => {
              const isExpanded = expandedDay === day;
              const daySlots = availability.filter((slot) => slot.day === day);
              
              return (
                <Card key={day} className="overflow-hidden">
                  <button
                    onClick={() => toggleDay(day)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="font-medium">{day}</span>
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
                            <p>No availability added for {day}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleAddTimeSlot(day)}
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
                              onClick={() => handleAddTimeSlot(day)}
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
          
          <div className="pt-4 flex justify-end">
            <Button
              onClick={handleSubmit}
              className="gap-2"
              disabled={availability.length === 0}
            >
              <Check size={18} />
              Submit Availability
            </Button>
          </div>
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
    </AnimatedTransition>
  );
};

export default EmployeeAvailability;
