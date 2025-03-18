
import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import AnimatedTransition from './AnimatedTransition';
import SimpleEmployeesList from './employees/SimpleEmployeesList';
import { useEmployees } from '@/hooks/useEmployees';

const EmployeeManager: React.FC = () => {
  const { employees, loading, updateEmployee } = useEmployees();

  console.log('EmployeeManager rendering with employees:', employees);

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
          <SimpleEmployeesList 
            employees={employees} 
            onUpdate={updateEmployee} 
          />
        </CardContent>
      </Card>
    </AnimatedTransition>
  );
};

export default EmployeeManager;
