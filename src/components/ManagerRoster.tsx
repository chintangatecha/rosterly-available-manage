
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Users, Clock, Save, Plus } from 'lucide-react';
import { format, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import AnimatedTransition from './AnimatedTransition';

// Mock data
const employees = [
  { id: '1', name: 'John Doe', initials: 'JD', avatarUrl: '', color: 'bg-blue-500' },
  { id: '2', name: 'Jane Smith', initials: 'JS', avatarUrl: '', color: 'bg-green-500' },
  { id: '3', name: 'Mike Johnson', initials: 'MJ', avatarUrl: '', color: 'bg-purple-500' },
  { id: '4', name: 'Sarah Williams', initials: 'SW', avatarUrl: '', color: 'bg-yellow-500' },
  { id: '5', name: 'David Brown', initials: 'DB', avatarUrl: '', color: 'bg-pink-500' },
];

interface Shift {
  id: string;
  employeeId: string;
  day: Date;
  startTime: string;
  endTime: string;
}

const ManagerRoster: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [availabilityView, setAvailabilityView] = useState(false);
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  const previousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleAddShift = (day: Date, employeeId: string) => {
    const newShift: Shift = {
      id: Date.now().toString(),
      employeeId,
      day,
      startTime: '09:00',
      endTime: '17:00',
    };
    
    setShifts([...shifts, newShift]);
    toast.success('Shift added successfully!');
  };

  const handleSaveRoster = () => {
    // In a real app, this would send data to a backend or Supabase
    console.log('Saving roster:', shifts);
    toast.success('Roster saved successfully!');
  };

  const getShiftsForDayAndEmployee = (day: Date, employeeId: string) => {
    return shifts.filter(
      (shift) => 
        format(shift.day, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
        shift.employeeId === employeeId
    );
  };
  
  const removeShift = (shiftId: string) => {
    setShifts(shifts.filter(shift => shift.id !== shiftId));
    toast.success('Shift removed successfully!');
  };
  
  return (
    <AnimatedTransition className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center mb-2 text-primary bg-primary/10 p-2 rounded-lg">
          <Calendar size={24} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Roster Management</h1>
        <p className="text-muted-foreground">Create and manage your team's schedule</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Weekly Roster</CardTitle>
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
            </div>
          </div>
          <CardDescription>
            {availabilityView
              ? "Viewing employee availability for this week"
              : "Drag and drop to assign shifts"}
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
        </CardHeader>
        
        <CardContent className="px-2">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header row with days */}
              <div className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-border">
                <div className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Staff
                </div>
                {weekDays.map((day) => (
                  <div
                    key={format(day, 'yyyy-MM-dd')}
                    className="px-2 py-3 text-center text-sm"
                  >
                    <div className="font-medium">{format(day, 'EEE')}</div>
                    <div className="text-xs text-muted-foreground">{format(day, 'MMM d')}</div>
                  </div>
                ))}
              </div>
              
              {/* Employee rows */}
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="grid grid-cols-[200px_repeat(7,1fr)] border-b border-border hover:bg-accent/5"
                >
                  <div className="px-4 py-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={employee.avatarUrl} />
                      <AvatarFallback className={employee.color}>
                        {employee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium truncate">{employee.name}</span>
                  </div>
                  
                  {weekDays.map((day) => {
                    const dayShifts = getShiftsForDayAndEmployee(day, employee.id);
                    
                    return (
                      <div
                        key={format(day, 'yyyy-MM-dd')}
                        className="p-2 border-l border-border relative"
                      >
                        {dayShifts.length > 0 ? (
                          dayShifts.map((shift) => (
                            <motion.div
                              key={shift.id}
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-xs mb-1 relative group"
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <Clock size={12} className="text-primary" />
                                <span>
                                  {shift.startTime} - {shift.endTime}
                                </span>
                              </div>
                              
                              <button
                                onClick={() => removeShift(shift.id)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-full p-0.5 hover:bg-background"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </button>
                            </motion.div>
                          ))
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="w-full h-full min-h-[60px] flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity">
                                <Plus size={16} className="text-muted-foreground" />
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Shift</DialogTitle>
                                <DialogDescription>
                                  Add a shift for {employee.name} on {format(day, 'EEEE, MMMM d')}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Button 
                                  onClick={() => handleAddShift(day, employee.id)}
                                  className="w-full"
                                >
                                  Add Default Shift (9AM - 5PM)
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveRoster} className="gap-2">
          <Save size={16} />
          Save Roster
        </Button>
      </div>
    </AnimatedTransition>
  );
};

export default ManagerRoster;
