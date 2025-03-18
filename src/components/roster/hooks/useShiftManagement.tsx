
import { useState } from 'react';
import { Shift, ShiftRecord, Employee, ShiftFormData } from '../types';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export const useShiftManagement = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [showAddShiftDialog, setShowAddShiftDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [shiftForm, setShiftForm] = useState<ShiftFormData>({
    startTime: '09:00',
    endTime: '17:00'
  });
  
  const { user } = useAuth();

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

  const openAddShiftDialog = (day: Date, employee: Employee) => {
    setSelectedDay(day);
    setSelectedEmployee(employee);
    setShiftForm({
      startTime: '09:00',
      endTime: '17:00'
    });
    setShowAddShiftDialog(true);
  };

  const handleShiftFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShiftForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddShift = async () => {
    if (!user || !selectedDay || !selectedEmployee) return;
    
    try {
      const newShift = {
        user_id: selectedEmployee.id,
        date: format(selectedDay, 'yyyy-MM-dd'),
        start_time: shiftForm.startTime,
        end_time: shiftForm.endTime,
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
      setShowAddShiftDialog(false);
      toast.success('Shift added successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add shift');
      console.error('Error adding shift:', error);
    }
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

  const getShiftsForDayAndEmployee = (day: Date, employeeId: string) => {
    return shifts.filter(
      (shift) => 
        format(shift.day, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') &&
        shift.employeeId === employeeId
    );
  };

  return {
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
  };
};
