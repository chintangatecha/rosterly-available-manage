
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';

interface AuthLayoutProps {
  requiredRole?: 'manager' | 'employee' | null;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ requiredRole = null }) => {
  const { user, profile, loading, isManager } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Role-based access control
  if (requiredRole) {
    // Manager route protection
    if (requiredRole === 'manager' && !isManager) {
      return <Navigate to="/employee" replace />;
    }
    
    // Employee route protection (allowing managers to also see employee views)
    if (requiredRole === 'employee' && profile?.role !== 'employee' && !isManager) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default AuthLayout;
