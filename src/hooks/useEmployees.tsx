
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Employee, colorClasses } from '@/components/employees/types';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee');
      
      if (error) throw error;
      
      // Transform profiles to our component's format
      const employeeData: Employee[] = (profiles || []).map((profile: any, index: number) => {
        const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email;
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        return {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role,
          initials,
          color: colorClasses[index % colorClasses.length]
        };
      });
      
      setEmployees(employeeData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load employees');
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const updateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prevEmployees => 
      prevEmployees.map(emp => 
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      )
    );
  };

  return {
    employees,
    loading,
    fetchEmployees,
    updateEmployee
  };
};
