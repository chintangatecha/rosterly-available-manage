import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Employee, ProfileRecord } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// List of common job roles in a workplace
const JOB_ROLES = [
  'Chef',
  'Sous Chef',
  'Line Cook',
  'Prep Cook',
  'Dishwasher',
  'Server',
  'Host/Hostess',
  'Bartender',
  'Barista',
  'Manager',
  'Assistant Manager',
  'Cashier',
  'Cleaner',
  'Security',
  'Maintenance',
  'Other'
];

interface EditEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEmployeeUpdated: () => void;
}

const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdated
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customRole, setCustomRole] = useState('');
  const [showCustomRole, setShowCustomRole] = useState(false);

  useEffect(() => {
    if (employee) {
      // Split the name into first and last name
      const nameParts = employee.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      
      // Set job role
      if (employee.jobRole) {
        if (JOB_ROLES.includes(employee.jobRole)) {
          setJobRole(employee.jobRole);
          setShowCustomRole(false);
        } else {
          setJobRole('Other');
          setCustomRole(employee.jobRole);
          setShowCustomRole(true);
        }
      } else {
        setJobRole('');
        setCustomRole('');
        setShowCustomRole(false);
      }
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employee) return;
    
    try {
      setIsSubmitting(true);
      
      const finalJobRole = jobRole === 'Other' ? customRole : jobRole;
      
      // Log the update attempt for debugging
      console.log('Attempting to update profile with ID:', employee.id);
      console.log('Update data:', {
        first_name: firstName,
        last_name: lastName,
        job_role: finalJobRole
      });
      
      // Get the authenticated user for debugging
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current authenticated user:', user);
      
      // Update the profile in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          job_role: finalJobRole
        })
        .eq('id', employee.id)
        .select();
      
      console.log('Update response:', { data, error });
      
      if (error) throw error;
      
      // Only show success if we actually have returned data
      if (data && data.length > 0) {
        toast.success('Employee information updated successfully');
        onEmployeeUpdated();
        onClose();
      } else {
        // This indicates the update might have failed silently
        toast.error('Update may have failed. No rows were affected.');
        console.error('No rows were affected by the update');
      }
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast.error(`Failed to update: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJobRoleChange = (value: string) => {
    setJobRole(value);
    setShowCustomRole(value === 'Other');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Employee Information</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobRole">Job Role</Label>
            <Select value={jobRole} onValueChange={handleJobRoleChange}>
              <SelectTrigger id="jobRole">
                <SelectValue placeholder="Select a job role" />
              </SelectTrigger>
              <SelectContent>
                {JOB_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {showCustomRole && (
            <div className="space-y-2">
              <Label htmlFor="customRole">Custom Job Role</Label>
              <Input
                id="customRole"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter custom job role"
                required={showCustomRole}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
