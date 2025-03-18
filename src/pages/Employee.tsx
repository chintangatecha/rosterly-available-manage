
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import EmployeeAvailability from '@/components/EmployeeAvailability';
import EmployeeShifts from '@/components/EmployeeShifts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SimpleAvailabilityForm from '@/components/SimpleAvailabilityForm';

const Employee = () => {
  const [activeTab, setActiveTab] = useState('simple');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="simple">Simple Entry</TabsTrigger>
            <TabsTrigger value="availability">My Availability</TabsTrigger>
            <TabsTrigger value="shifts">My Shifts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="simple">
            <SimpleAvailabilityForm />
          </TabsContent>
          
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
