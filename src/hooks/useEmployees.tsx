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
        // Generate initials from first and last name or use email
        const firstInitial = profile.first_name ? profile.first_name[0] : '';
        const lastInitial = profile.last_name ? profile.last_name[0] : '';
        const initials = (firstInitial + lastInitial).toUpperCase() || 
                         profile.email.substring(0, 2).toUpperCase();
        
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
      
      console.log('Fetched employees:', employeeData);
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

  const updateEmployee = async (updatedEmployee: Employee) => {
    console.log('Updating employee in hook:', updatedEmployee);
    
    try {
      const loadingToast = toast.loading('Saving changes...');
      
      // Update the employee in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: updatedEmployee.first_name,
          last_name: updatedEmployee.last_name,
          // Don't update email or role as they shouldn't change
        })
        .eq('id', updatedEmployee.id);
        
      if (error) throw error;
      
      // Update the UI immediately
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.id === updatedEmployee.id ? updatedEmployee : emp
        )
      );
      
      toast.dismiss(loadingToast);
      toast.success('Employee updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update employee');
      console.error('Error updating employee:', error);
    }
  };

  return {
    employees,
    loading,
    fetchEmployees,
    updateEmployee
  };
};
