
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ManagerRoster from '@/components/ManagerRoster';
import EmployeeManager from '@/components/EmployeeManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Manager = () => {
  const [activeTab, setActiveTab] = useState('roster');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="roster">Schedule Roster</TabsTrigger>
            <TabsTrigger value="employees">Manage Employees</TabsTrigger>
          </TabsList>
          
          <TabsContent value="roster">
            <ManagerRoster />
          </TabsContent>
          
          <TabsContent value="employees">
            <EmployeeManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Manager;
