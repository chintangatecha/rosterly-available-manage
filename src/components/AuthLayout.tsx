
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';

interface AuthLayoutProps {
  requiredRole?: 'manager' | 'employee' | null;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ requiredRole = null }) => {
  const { user, profile, loading } = useAuth();
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

  // If requiredRole is specified, check if user has that role
  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    if (profile?.role === 'manager') {
      return <Navigate to="/manager" replace />;
    } else {
      return <Navigate to="/employee" replace />;
    }
  }

  // If logged in and has the required role (or no role required), allow access to the requested route
  return <Outlet />;
};

export default AuthLayout;
