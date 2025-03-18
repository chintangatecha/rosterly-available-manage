
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Auth from '@/components/Auth';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirect based on role if already logged in
      if (profile.role === 'manager') {
        navigate('/manager');
      } else {
        navigate('/employee');
      }
    }
  }, [user, profile, loading, navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Hero />
        <div className="mt-12">
          <Auth />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
