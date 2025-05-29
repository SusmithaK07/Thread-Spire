import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HeroSectionDemo } from '@/components/blocks/hero-section-demo';

const Index = () => {
  const { isAuthenticated } = useAuth();

  // If user is authenticated, redirect to home page
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Otherwise, show the landing page with HeroSectionDemo
  return <HeroSectionDemo />;
};

export default Index;
