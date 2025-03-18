
import React, { useEffect } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AnimatedTransition from './AnimatedTransition';
import EmployeesList from './employees/EmployeesList';
import { useEmployees } from '@/hooks/useEmployees';

const EmployeeManager: React.FC = () => {
  const { employees, loading, updateEmployee, fetchEmployees } = useEmployees();

  console.log('EmployeeManager rendering with employees:', employees);

  useEffect(() => {
    // Fetch employees when component mounts
    fetchEmployees();
  }, [fetchEmployees]);

  const handleRefresh = () => {
    fetchEmployees();
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

  const handleEmployeeUpdate = (updatedEmployee) => {
    console.log('Employee update handler called in EmployeeManager:', updatedEmployee);
    updateEmployee(updatedEmployee);
  };

  return (
    <AnimatedTransition>
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Employee Management</span>
            </CardTitle>
            <CardDescription>
              View and edit employee information
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <EmployeesList 
            employees={employees} 
            onEmployeeUpdate={handleEmployeeUpdate} 
          />
        </CardContent>
      </Card>
    </AnimatedTransition>
  );
};

export default EmployeeManager;
