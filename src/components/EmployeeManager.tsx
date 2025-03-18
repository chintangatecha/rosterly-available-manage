
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Edit, Save, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import AnimatedTransition from './AnimatedTransition';
import { supabase } from '@/integrations/supabase/client';

interface Employee {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  initials: string;
  color: string;
}

const colorClasses = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-emerald-500',
];

const EmployeeManager: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

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
        const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email;
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
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
      
      setEmployees(employeeData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load employees');
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (employee: Employee) => {
    setEditingId(employee.id);
    setEditForm({
      firstName: employee.first_name || '',
      lastName: employee.last_name || '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.firstName || null,
          last_name: editForm.lastName || null,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state
      setEmployees(employees.map(emp => 
        emp.id === id 
          ? { 
              ...emp, 
              first_name: editForm.firstName || null, 
              last_name: editForm.lastName || null,
              initials: [editForm.firstName, editForm.lastName]
                .filter(Boolean)
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)
            } 
          : emp
      ));
      
      setEditingId(null);
      toast.success('Employee updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update employee');
      console.error('Error updating employee:', error);
    }
  };

  if (loading) {
    return (
      <AnimatedTransition>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AnimatedTransition>
    );
  }

  return (
    <AnimatedTransition>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Employee Management</span>
          </CardTitle>
          <CardDescription>
            View and edit employee information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => (
              <motion.div 
                key={employee.id}
                className="p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback className={employee.color}>
                        {employee.initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    {editingId === employee.id ? (
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
                    {editingId === employee.id ? (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => saveEmployee(employee.id)}
                          className="flex items-center gap-1"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={cancelEditing}
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
                        onClick={() => startEditing(employee)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {employees.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No employees found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AnimatedTransition>
  );
};

export default EmployeeManager;
