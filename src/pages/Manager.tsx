
import React from 'react';
import Layout from '@/components/Layout';
import ManagerRoster from '@/components/ManagerRoster';
import { useIsMobile } from '@/hooks/use-mobile';

const Manager = () => {
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className={`container mx-auto px-4 py-4 ${isMobile ? 'pb-20' : 'py-8'}`}>
        <ManagerRoster />
      </div>
    </Layout>
  );
};

export default Manager;
