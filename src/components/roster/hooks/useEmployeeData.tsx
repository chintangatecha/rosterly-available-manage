
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Employee, AvailabilityRecord, ProfileRecord, colorClasses } from '../types';

export const useEmployeeData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeAvailability, setEmployeeAvailability] = useState<AvailabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
      } catch (error: any) {
        toast.error(error.message || 'Failed to load data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  return {
    employees,
    employeeAvailability,
    loading
  };
};
