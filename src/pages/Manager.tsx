
import React from 'react';
import Layout from '@/components/Layout';
import ManagerRoster from '@/components/ManagerRoster';

const Manager = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <ManagerRoster />
      </div>
    </Layout>
  );
};

export default Manager;
