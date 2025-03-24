import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface AddEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded: () => void;
}

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  isOpen,
  onClose,
  onEmployeeAdded
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomRole, setShowCustomRole] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setJobRole('');
    setCustomRole('');
    setShowCustomRole(false);
    setEmailError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    
    try {
      setIsSubmitting(true);
      
      const finalJobRole = jobRole === 'Other' ? customRole : jobRole;
      
      // First check if the email exists in auth users
      // We can't directly query auth.users, so we'll check if the email exists in profiles
      // If it doesn't exist in profiles but is a valid auth user, we can create it
      const { data: existingProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email);
      
      if (profileError) throw profileError;
      
      if (existingProfiles && existingProfiles.length > 0) {
        setEmailError('This email is already associated with an employee profile.');
        return;
      }
      
      // Create the profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email,
          job_role: finalJobRole,
          role: 'employee' // Default role is employee
        } as any)
        .select();
      
      if (error) throw error;
      
      toast.success('Employee added successfully');
      onEmployeeAdded();
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast.error(`Failed to add employee: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJobRoleChange = (value: string) => {
    setJobRole(value);
    setShowCustomRole(value === 'Other');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
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
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className={emailError ? 'border-red-500' : ''}
            />
            {emailError && (
              <p className="text-sm text-red-500">{emailError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              The email must already exist in Supabase Auth.
            </p>
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
              {isSubmitting ? 'Adding...' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
