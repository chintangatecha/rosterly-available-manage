
import React from 'react';
import { Users } from 'lucide-react';
import { Employee } from './types';
import EmployeeCard from './EmployeeCard';

interface EmployeesListProps {
  employees: Employee[];
  onEmployeeUpdate: (updatedEmployee: Employee) => void;
}

const EmployeesList: React.FC<EmployeesListProps> = ({ employees, onEmployeeUpdate }) => {
  return (
    <div className="space-y-4">
      {employees.map((employee) => (
        <EmployeeCard 
          key={employee.id} 
          employee={employee} 
          onEmployeeUpdate={onEmployeeUpdate} 
        />
      ))}
      
      {employees.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No employees found</p>
        </div>
      )}
    </div>
  );
};

export default EmployeesList;
