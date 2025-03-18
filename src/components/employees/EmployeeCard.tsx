
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Employee } from './types';
import EmployeeAvatar from './EmployeeAvatar';
import { supabase } from '@/integrations/supabase/client';

interface EmployeeCardProps {
  employee: Employee;
  onEmployeeUpdate: (updatedEmployee: Employee) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEmployeeUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: employee.first_name || '',
    lastName: employee.last_name || '',
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveEmployee = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Saving changes...');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.firstName || null,
          last_name: editForm.lastName || null,
        })
        .eq('id', employee.id);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (error) throw error;
      
      // Get updated data from Supabase to ensure we're in sync
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', employee.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Calculate new initials based on the updated profile
      const initials = [updatedProfile.first_name, updatedProfile.last_name]
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      
      // Create the updated employee object
      const updatedEmployee: Employee = { 
        ...employee, 
        first_name: updatedProfile.first_name, 
        last_name: updatedProfile.last_name,
        initials 
      };
      
      // Update the parent component's state
      onEmployeeUpdate(updatedEmployee);
      setIsEditing(false);
      toast.success('Employee updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update employee');
      console.error('Error updating employee:', error);
    }
  };

  return (
    <motion.div 
      className="p-4 border rounded-lg hover:bg-accent/5 transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <EmployeeAvatar initials={employee.initials} color={employee.color} />
          
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleFormChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleFormChange}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{employee.email}</div>
            </div>
          ) : (
            <div>
              <div className="font-medium">
                {[employee.first_name, employee.last_name].filter(Boolean).join(' ') || 
                  <span className="italic text-muted-foreground">No name set</span>}
              </div>
              <div className="text-sm text-muted-foreground">{employee.email}</div>
            </div>
          )}
        </div>
        
        <div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={saveEmployee}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeCard;
