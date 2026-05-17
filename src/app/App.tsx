import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Benefits } from './components/Benefits';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { router } from './routes.tsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'signup' | 'dashboard'>('home');

  useEffect(() => {
    // Function to handle hash changes and initial load
    const handleNavigation = () => {
      const hash = window.location.hash.slice(1);
      const path = window.location.pathname;

      // If we're on a dashboard route (learner or admin), show dashboard
      if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
        setCurrentPage('dashboard');
      } else if (hash === 'login' || path === '/login') {
        setCurrentPage('login');
      } else if (hash === 'signup' || path === '/signup') {
        setCurrentPage('signup');
      } else if (hash === 'dashboard') {
        // Convert hash-based routing to path-based routing
        window.history.replaceState({}, '', '/dashboard');
        setCurrentPage('dashboard');
      } else if (path === '/' && !hash) {
        setCurrentPage('home');
      } else {
        setCurrentPage('home');
      }

    };

    // Set initial page
    handleNavigation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  return (
    <>
      <Toaster position="top-right" richColors />
      {currentPage === 'login' ? (
        <Login />
      ) : currentPage === 'signup' ? (
        <Signup />
      ) : currentPage === 'dashboard' ? (
        <RouterProvider router={router} />
      ) : (
        <div className="min-h-screen bg-white">
          <Hero />
          <Features />
          <Benefits />
          <CTA />
          <Footer />
        </div>
      )}
    </>
  );
}