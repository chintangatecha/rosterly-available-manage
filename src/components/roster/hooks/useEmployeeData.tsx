
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Employee, AvailabilityRecord, ProfileRecord, colorClasses } from '../types';

export const useEmployeeData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeAvailability, setEmployeeAvailability] = useState<AvailabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Fetch all employees - simplify query to avoid join errors
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee');
        
      console.log('Fetched profiles:', profiles);
      
      console.log('Raw profiles data:', profiles);
      
      // If we have profiles with sections, fetch the section data separately
      let sectionsData = {};
      if (profiles && profiles.length > 0) {
        const sectionIds = profiles
          .filter(p => p.section)
          .map(p => p.section);
          
        console.log('Section IDs extracted from profiles:', sectionIds);
          
        if (sectionIds.length > 0) {
          const { data: sections, error: sectionsError } = await supabase
            .from('sections')
            .select('*')
            .in('id', sectionIds);
            
          if (sectionsError) {
            console.error('Error fetching sections:', sectionsError);
          }
            
          if (sections) {
            console.log('Sections data:', sections);
            sectionsData = sections.reduce((acc, section) => {
              acc[section.id] = section;
              return acc;
            }, {});
          }
        }
      }
      
      if (profilesError) throw profilesError;
      
      // Transform profiles to our component's format
      const employeeData: Employee[] = (profiles as any[]).map((profile, index) => {
        const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email;
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        // Get section data if available
        const sectionData = profile.section && sectionsData[profile.section] 
          ? sectionsData[profile.section] 
          : null;
          
        const employeeObj = {
          id: profile.id,
          name,
          initials,
          avatarUrl: '',
          color: colorClasses[index % colorClasses.length],
          jobRole: profile.job_role || null,
          section: profile.section ? {
            id: profile.section,
            name: sectionData ? sectionData.name : 'Unknown Section'
          } : null
        };
        
        return employeeObj;
      });
      
      console.log('Transformed employee data:', employeeData);
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
  
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Log when the component rerenders to help track any issues
  useEffect(() => {
    console.log('useEmployeeData hook - current employees state:', employees);
  }, [employees]);
  
  return {
    employees,
    employeeAvailability,
    loading,
    fetchEmployees
  };
};
