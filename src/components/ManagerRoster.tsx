
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Users, Clock, Save, Plus, LogOut } from 'lucide-react';
import { format, addDays, startOfWeek, subWeeks, addWeeks, parseISO } from 'date-fns';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Employee {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string;
  color: string;
}

interface Shift {
  id: string;
  employeeId: string;
  day: Date;
  startTime: string;
  endTime: string;
}

interface AvailabilityRecord {
  id: string;
  user_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

interface ProfileRecord {
  id: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
}

interface ShiftRecord {
  id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  created_by: string;
}

const colorClasses = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-emerald-500',
];

const ManagerRoster: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [availabilityView, setAvailabilityView] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeeAvailability, setEmployeeAvailability] = useState<AvailabilityRecord[]>([]);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        
        // Fetch all employees
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'employee');
        
        if (profilesError) throw profilesError;
        
        // Transform profiles to our component's format
        const employeeData: Employee[] = (profiles as ProfileRecord[]).map((profile, index) => {
          const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email;
          const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
          
          return {
            id: profile.id,
            name,
            initials,
            avatarUrl: '',
            color: colorClasses[index % colorClasses.length]
          };
        });
        
        setEmployees(employeeData);
        
        // Fetch all availability
        const { data: availability, error: availabilityError } = await supabase
          .from('availability')
          .select('*');
        
        if (availabilityError) throw availabilityError;
        
        setEmployeeAvailability(availability as AvailabilityRecord[]);
        
        // Fetch current shifts
        await fetchShifts();
      } catch (error: any) {
        toast.error(error.message || 'Failed to load data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);
  
  const fetchShifts = async () => {
    try {
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*');
      
      if (shiftsError) throw shiftsError;
      
      // Transform shifts to our component's format
      const transformedShifts: Shift[] = (shiftsData as ShiftRecord[]).map(shift => ({
        id: shift.id,
        employeeId: shift.user_id,
        day: parseISO(shift.date),
        startTime: shift.start_time.slice(0, 5),
        endTime: shift.end_time.slice(0, 5),
      }));
      
      setShifts(transformedShifts);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load shifts');
      console.error('Error fetching shifts:', error);
    }
  };

  const previousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleAddShift = async (day: Date, employeeId: string) => {
    if (!user) return;
    
    try {
      const newShift = {
        user_id: employeeId,
        date: format(day, 'yyyy-MM-dd'),
        start_time: '09:00',
        end_time: '17:00',
        created_by: user.id
      };
      
      const { data, error } = await supabase
        .from('shifts')
        .insert(newShift)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // Add to local state
      const transformedShift: Shift = {
        id: data.id,
        employeeId: data.user_id,
        day: parseISO(data.date),
        startTime: data.start_time.slice(0, 5),
        endTime: data.end_time.slice(0, 5),
      };
      
      setShifts([...shifts, transformedShift]);
      toast.success('Shift added successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add shift');
      console.error('Error adding shift:', error);
    }
  };

  const handleSaveRoster = async () => {
    toast.success('Roster saved successfully!');
  };

  const getShiftsForDayAndEmployee = (day: Date, employeeId: string) => {
    return shifts.filter(
      (shift) => 
        format(shift.day, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
        shift.employeeId === employeeId
    );
  };
  
  const removeShift = async (shiftId: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);
      
      if (error) throw error;
      
      setShifts(shifts.filter(shift => shift.id !== shiftId));
      toast.success('Shift removed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove shift');
      console.error('Error removing shift:', error);
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  // Check if employee is available on a specific day
  const isEmployeeAvailable = (employeeId: string, day: Date) => {
    const dayOfWeek = format(day, 'EEEE');
    return employeeAvailability.some(a => 
      a.user_id === employeeId && 
      a.day_of_week === dayOfWeek
    );
  };
  
  if (loading) {
    return (
      <AnimatedTransition className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AnimatedTransition>
    );
  }
  
  return (
    <AnimatedTransition className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center mb-2 text-primary bg-primary/10 p-2 rounded-lg">
          <Calendar size={24} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Roster Management</h1>
        <p className="text-muted-foreground">Create and manage your team's schedule</p>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut size={16} />
            Logout
          </Button>
        </div>
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
                    const employeeAvailable = isEmployeeAvailable(employee.id, day);
                    
                    return (
                      <div
                        key={format(day, 'yyyy-MM-dd')}
                        className={`p-2 border-l border-border relative ${
                          availabilityView && !employeeAvailable ? 'bg-red-50/30' : 
                          availabilityView && employeeAvailable ? 'bg-green-50/30' : ''
                        }`}
                      >
                        {availabilityView && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {employeeAvailable ? (
                              <span className="text-green-600">Available</span>
                            ) : (
                              <span className="text-red-500">Unavailable</span>
                            )}
                          </div>
                        )}
                        
                        {!availabilityView && (
                          <>
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
                                      disabled={!employeeAvailable}
                                    >
                                      {employeeAvailable 
                                        ? 'Add Default Shift (9AM - 5PM)' 
                                        : 'Employee not available on this day'}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </>
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
