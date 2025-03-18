
import React from 'react';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Auth from '@/components/Auth';

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Hero />
        <div id="login" className="mt-12 pt-8 scroll-mt-20">
          <Auth />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
