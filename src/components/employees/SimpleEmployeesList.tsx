
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Employee } from './types';

interface SimpleEmployeesListProps {
  employees: Employee[];
  onUpdate: (id: string, firstName: string, lastName: string) => Promise<void>;
}

const SimpleEmployeesList: React.FC<SimpleEmployeesListProps> = ({ employees, onUpdate }) => {
  // Local state for forms
  const [editForms, setEditForms] = useState<Record<string, { firstName: string, lastName: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  const startEditing = (employee: Employee) => {
    setEditForms({
      ...editForms,
      [employee.id]: {
        firstName: employee.first_name || '',
        lastName: employee.last_name || ''
      }
    });
  };

  const handleChange = (employeeId: string, field: 'firstName' | 'lastName', value: string) => {
    setEditForms({
      ...editForms,
      [employeeId]: {
        ...editForms[employeeId],
        [field]: value
      }
    });
  };

  const handleSubmit = async (employeeId: string) => {
    try {
      setIsSubmitting({
        ...isSubmitting,
        [employeeId]: true
      });
      
      const form = editForms[employeeId];
      await onUpdate(employeeId, form.firstName, form.lastName);
      
      // Clear the form after successful update
      const newEditForms = { ...editForms };
      delete newEditForms[employeeId];
      setEditForms(newEditForms);
    } finally {
      setIsSubmitting({
        ...isSubmitting,
        [employeeId]: false
      });
    }
  };

  return (
    <div className="space-y-4">
      {employees.map((employee) => (
        <Card key={employee.id} className="overflow-hidden">
          <CardContent className="p-4">
            {editForms[employee.id] ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">First Name</p>
                  <Input
                    value={editForms[employee.id].firstName}
                    onChange={(e) => handleChange(employee.id, 'firstName', e.target.value)}
                    placeholder="First Name"
                    disabled={isSubmitting[employee.id]}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Last Name</p>
                  <Input
                    value={editForms[employee.id].lastName}
                    onChange={(e) => handleChange(employee.id, 'lastName', e.target.value)}
                    placeholder="Last Name"
                    disabled={isSubmitting[employee.id]}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleSubmit(employee.id)}
                    disabled={isSubmitting[employee.id]}
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const newEditForms = { ...editForms };
                      delete newEditForms[employee.id];
                      setEditForms(newEditForms);
                    }}
                    disabled={isSubmitting[employee.id]}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{employee.email}</p>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p>
                    {[employee.first_name, employee.last_name].filter(Boolean).join(' ') || 
                    <span className="italic text-muted-foreground">No name set</span>}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => startEditing(employee)}
                >
                  Edit Employee
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {employees.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No employees found</p>
        </div>
      )}
    </div>
  );
};

export default SimpleEmployeesList;
