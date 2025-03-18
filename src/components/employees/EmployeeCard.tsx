import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Employee } from './types';
import EmployeeAvatar from './EmployeeAvatar';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveEmployee = async () => {
    try {
      setIsLoading(true);
      
      // Calculate new initials based on updated data
      const firstNameInitial = editForm.firstName ? editForm.firstName[0] : '';
      const lastNameInitial = editForm.lastName ? editForm.lastName[0] : '';
      const initials = (firstNameInitial + lastNameInitial).toUpperCase() || 
                      employee.email.substring(0, 2).toUpperCase();
      
      // Create the updated employee object with all required fields
      const updatedEmployee: Employee = { 
        ...employee,
        first_name: editForm.firstName, 
        last_name: editForm.lastName,
        initials: initials,
      };
      
      console.log('Updating employee from card:', updatedEmployee);
      
      // Update the parent component's state, which will handle the Supabase update
      onEmployeeUpdate(updatedEmployee);
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update employee');
      console.error('Error updating employee:', error);
    } finally {
      setIsLoading(false);
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
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
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
