import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { RosterVersion, RosterShift } from '../types';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';

export const useRosterVersions = (weekStart: Date) => {
  const [rosterVersions, setRosterVersions] = useState<RosterVersion[]>([]);
  const [currentRosterVersion, setCurrentRosterVersion] = useState<RosterVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Format the week start date for database queries
  const formattedWeekStart = format(weekStart, 'yyyy-MM-dd');

  // Fetch roster versions for the current week
  const fetchRosterVersions = async () => {
    try {
      setLoading(true);
      
      // Get roster versions for the current week
      const { data: versionData, error: versionError } = await supabase
        .from('roster_versions')
        .select('*')
        .eq('week_start', formattedWeekStart)
        .order('created_at', { ascending: false });
      
      if (versionError) throw versionError;
      
      if (!versionData || versionData.length === 0) {
        // No roster versions exist for this week, create an operational version
        await createRosterVersion('operational', `Week of ${format(weekStart, 'MMM d, yyyy')}`);
        return;
      }
      
      // Get all shifts for these roster versions
      const versionIds = versionData.map((v: Tables<'roster_versions'>) => v.id);
      
      const { data: shiftData, error: shiftError } = await supabase
        .from('roster_shifts')
        .select('*')
        .in('roster_version_id', versionIds);
      
      if (shiftError) throw shiftError;
      
      // Transform the data
      const transformedVersions = versionData.map((version: Tables<'roster_versions'>) => {
        // Find shifts for this version
        const versionShifts = (shiftData || []).filter(
          (shift: Tables<'roster_shifts'>) => shift.roster_version_id === version.id
        );
        
        // Transform shifts
        const transformedShifts = versionShifts.map((shift: Tables<'roster_shifts'>) => ({
          id: shift.id,
          rosterVersionId: shift.roster_version_id,
          employeeId: shift.user_id,
          day: parseISO(shift.date),
          startTime: shift.start_time,
          endTime: shift.end_time
        }));
        
        return {
          id: version.id,
          name: version.name,
          type: version.type as 'operational' | 'finalized',
          weekStart: parseISO(version.week_start),
          isActive: version.is_active,
          shifts: transformedShifts
        };
      });
      
      setRosterVersions(transformedVersions);
      
      // Set the current roster version (prefer operational)
      const operationalVersion = transformedVersions.find(v => v.type === 'operational' && v.isActive);
      const finalizedVersion = transformedVersions.find(v => v.type === 'finalized' && v.isActive);
      
      // Sort versions to show finalized versions at the top
      transformedVersions.sort((a, b) => {
        // First sort by type (finalized first)
        if (a.type === 'finalized' && b.type !== 'finalized') return -1;
        if (a.type !== 'finalized' && b.type === 'finalized') return 1;
        // Then sort by created date (newest first)
        return 0;
      });
      
      setRosterVersions(transformedVersions);
      
      // Set current version (prefer operational for editing)
      if (operationalVersion) {
        setCurrentRosterVersion(operationalVersion);
      } else if (finalizedVersion) {
        setCurrentRosterVersion(finalizedVersion);
      } else if (transformedVersions.length > 0) {
        setCurrentRosterVersion(transformedVersions[0]);
      }
    } catch (error: any) {
      console.error('Error fetching roster versions:', error);
      toast.error(`Failed to load roster versions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create a new roster version
  const createRosterVersion = async (type: 'operational' | 'finalized', name?: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const versionName = name || `${type.charAt(0).toUpperCase() + type.slice(1)} Roster - ${format(weekStart, 'MMM d, yyyy')}`;
      
      const { data, error } = await supabase
        .from('roster_versions')
        .insert({
          name: versionName,
          type,
          week_start: formattedWeekStart,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success(`Created new ${type} roster version`);
      
      // Refresh roster versions
      await fetchRosterVersions();
      
      return data;
    } catch (error: any) {
      console.error('Error creating roster version:', error);
      toast.error(`Failed to create roster version: ${error.message}`);
      return null;
    }
  };

  // Copy a roster version
  const copyRosterVersion = async (sourceVersionId: string, type: 'operational' | 'finalized') => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      // First create a new roster version
      const { data: newVersion, error: versionError } = await supabase
        .from('roster_versions')
        .insert({
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Roster - ${format(weekStart, 'MMM d, yyyy')} (Copy)`,
          type,
          week_start: formattedWeekStart,
          created_by: user.id,
          is_active: true
        })
        .select()
        .single();
      
      if (versionError) throw versionError;
      
      // Get shifts from the source version
      const { data: sourceShifts, error: shiftsError } = await supabase
        .from('roster_shifts')
        .select('*')
        .eq('roster_version_id', sourceVersionId);
      
      if (shiftsError) throw shiftsError;
      
      if (sourceShifts && sourceShifts.length > 0) {
        // Prepare shifts for the new version
        const newShifts = sourceShifts.map((shift: Tables<'roster_shifts'>) => ({
          roster_version_id: newVersion.id,
          user_id: shift.user_id,
          date: shift.date,
          start_time: shift.start_time,
          end_time: shift.end_time,
          created_by: user.id
        }));
        
        // Insert the new shifts
        const { error: insertError } = await supabase
          .from('roster_shifts')
          .insert(newShifts);
        
        if (insertError) throw insertError;
      }
      
      toast.success(`Created a copy of the roster as ${type}`);
      
      // Refresh roster versions
      await fetchRosterVersions();
      
      return newVersion;
    } catch (error: any) {
      console.error('Error copying roster version:', error);
      toast.error(`Failed to copy roster: ${error.message}`);
      return null;
    }
  };

  // Add a shift to the current roster version
  const addShift = async (employeeId: string, day: Date, startTime: string, endTime: string) => {
    try {
      if (!currentRosterVersion) {
        throw new Error('No active roster version');
      }
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('roster_shifts')
        .insert({
          roster_version_id: currentRosterVersion.id,
          user_id: employeeId,
          date: format(day, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime,
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const newShift: RosterShift = {
        id: data.id,
        rosterVersionId: data.roster_version_id,
        employeeId: data.user_id,
        day,
        startTime: data.start_time,
        endTime: data.end_time
      };
      
      setCurrentRosterVersion(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          shifts: [...prev.shifts, newShift]
        };
      });
      
      setRosterVersions(prev => {
        return prev.map(version => {
          if (version.id === currentRosterVersion.id) {
            return {
              ...version,
              shifts: [...version.shifts, newShift]
            };
          }
          return version;
        });
      });
      
      return data;
    } catch (error: any) {
      console.error('Error adding shift:', error);
      toast.error(`Failed to add shift: ${error.message}`);
      return null;
    }
  };

  // Remove a shift from the current roster version
  const removeShift = async (shiftId: string) => {
    try {
      if (!currentRosterVersion) {
        throw new Error('No active roster version');
      }
      
      const { error } = await supabase
        .from('roster_shifts')
        .delete()
        .eq('id', shiftId);
      
      if (error) throw error;
      
      // Update local state
      setCurrentRosterVersion(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          shifts: prev.shifts.filter(shift => shift.id !== shiftId)
        };
      });
      
      setRosterVersions(prev => {
        return prev.map(version => {
          if (version.id === currentRosterVersion.id) {
            return {
              ...version,
              shifts: version.shifts.filter(shift => shift.id !== shiftId)
            };
          }
          return version;
        });
      });
      
      return true;
    } catch (error: any) {
      console.error('Error removing shift:', error);
      toast.error(`Failed to remove shift: ${error.message}`);
      return false;
    }
  };

  // Change the current roster version
  const changeRosterVersion = (versionId: string) => {
    const version = rosterVersions.find(v => v.id === versionId);
    if (version) {
      setCurrentRosterVersion(version);
    }
  };

  // Load roster versions when the week changes
  useEffect(() => {
    if (user) {
      fetchRosterVersions();
    }
  }, [formattedWeekStart, user]);

  return {
    rosterVersions,
    currentRosterVersion,
    loading,
    fetchRosterVersions,
    createRosterVersion,
    copyRosterVersion,
    addShift,
    removeShift,
    changeRosterVersion
  };
};
