
import React, { useState, useEffect } from 'react';
import { startOfWeek, subWeeks, addWeeks, addDays, format, parseISO, isEqual } from 'date-fns';
import { Calendar, Save, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AnimatedTransition from './AnimatedTransition';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Import our new components
import RosterHeader from './roster/RosterHeader';
import RosterTable from './roster/RosterTable';
import AddShiftDialog from './roster/AddShiftDialog';
import { useEmployeeData } from './roster/hooks/useEmployeeData';
import { useShiftManagement } from './roster/hooks/useShiftManagement';

const ManagerRoster: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [availabilityView, setAvailabilityView] = useState(false);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const { employees, employeeAvailability, loading } = useEmployeeData();
  const { 
    shifts, 
    fetchShifts,
    showAddShiftDialog,
    setShowAddShiftDialog,
    selectedDay,
    selectedEmployee,
    shiftForm,
    getShiftsForDayAndEmployee,
    openAddShiftDialog,
    handleShiftFormChange,
    handleAddShift,
    removeShift
  } = useShiftManagement();

  // Fixed: Create an array of Date objects using addDays instead of setDate
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    fetchShifts();
  }, []);
  
  const previousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const nextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleSaveRoster = async () => {
    toast.success('Roster saved successfully!');
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  // Check if employee is available on a specific day
  const isEmployeeAvailable = (employeeId: string, day: Date) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    return employeeAvailability.some(a => 
      a.user_id === employeeId && 
      a.date === formattedDate
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
          <RosterHeader
            currentWeekStart={currentWeekStart}
            previousWeek={previousWeek}
            nextWeek={nextWeek}
            availabilityView={availabilityView}
            setAvailabilityView={setAvailabilityView}
          />
        </CardHeader>
        
        <CardContent className="px-2">
          <RosterTable
            weekDays={weekDays}
            employees={employees}
            shifts={shifts}
            availabilityView={availabilityView}
            getShiftsForDayAndEmployee={getShiftsForDayAndEmployee}
            isEmployeeAvailable={isEmployeeAvailable}
            openAddShiftDialog={openAddShiftDialog}
            removeShift={removeShift}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveRoster} className="gap-2">
          <Save size={16} />
          Save Roster
        </Button>
      </div>
      
      {/* Add Shift Dialog */}
      <AddShiftDialog
        isOpen={showAddShiftDialog}
        onClose={() => setShowAddShiftDialog(false)}
        selectedDay={selectedDay}
        selectedEmployee={selectedEmployee}
        shiftForm={shiftForm}
        onChange={handleShiftFormChange}
        onSubmit={handleAddShift}
        isEmployeeAvailable={!!selectedDay && !!selectedEmployee && isEmployeeAvailable(selectedEmployee.id, selectedDay)}
      />
    </AnimatedTransition>
  );
};

export default ManagerRoster;
