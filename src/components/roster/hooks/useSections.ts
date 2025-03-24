import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Section } from '../types';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';

export const useSections = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch all sections
  const fetchSections = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Transform the data to match the Section type
      const transformedSections: Section[] = (data || []).map((section: Tables<'sections'>) => ({
        id: section.id,
        name: section.name
      }));
      
      setSections(transformedSections);
    } catch (error: any) {
      console.error('Error fetching sections:', error);
      toast.error(`Failed to load sections: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add a new section
  const addSection = async (name: string) => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('sections')
        .insert({
          name,
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Transform the data to match the Section type
      const newSection: Section = {
        id: data.id,
        name: data.name
      };
      
      setSections(prev => [...prev, newSection]);
      toast.success(`Added new section: ${name}`);
      
      return data;
    } catch (error: any) {
      console.error('Error adding section:', error);
      toast.error(`Failed to add section: ${error.message}`);
      return null;
    }
  };

  // Update a section
  const updateSection = async (id: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .update({ name })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setSections(prev => 
        prev.map(section => section.id === id ? { ...section, name } : section)
      );
      
      toast.success(`Updated section: ${name}`);
      return data;
    } catch (error: any) {
      console.error('Error updating section:', error);
      toast.error(`Failed to update section: ${error.message}`);
      return null;
    }
  };

  // Delete a section
  const deleteSection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSections(prev => prev.filter(section => section.id !== id));
      toast.success('Section deleted');
      
      return true;
    } catch (error: any) {
      console.error('Error deleting section:', error);
      toast.error(`Failed to delete section: ${error.message}`);
      return false;
    }
  };

  // Update an employee's section
  const updateEmployeeSection = async (employeeId: string, sectionId: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ section: sectionId })
        .eq('id', employeeId);
      
      if (error) throw error;
      
      toast.success('Employee section updated');
      return true;
    } catch (error: any) {
      console.error('Error updating employee section:', error);
      toast.error(`Failed to update employee section: ${error.message}`);
      return false;
    }
  };

  // Load sections on component mount
  useEffect(() => {
    fetchSections();
  }, []);

  return {
    sections,
    loading,
    fetchSections,
    addSection,
    updateSection,
    deleteSection,
    updateEmployeeSection
  };
};
