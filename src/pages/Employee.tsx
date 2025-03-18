
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import EmployeeAvailability from '@/components/EmployeeAvailability';
import EmployeeShifts from '@/components/EmployeeShifts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Employee = () => {
  const [activeTab, setActiveTab] = useState('availability');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="availability">My Availability</TabsTrigger>
            <TabsTrigger value="shifts">My Shifts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="availability">
            <EmployeeAvailability />
          </TabsContent>
          
          <TabsContent value="shifts">
            <EmployeeShifts />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Employee;
