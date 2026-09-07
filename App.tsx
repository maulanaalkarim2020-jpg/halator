import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './index.css';
import LandingHeader from './components/LandingHeader';
import AppSidebar from './components/AppSidebar';
import AppTopbar from './components/AppTopbar';
import MobileBottomBar from './components/MobileBottomBar';
import HomeScreen from './screens/HomeScreen';
import ProductAuditScreen from './screens/ProductAuditScreen';
import ProcessAuditScreen from './screens/ProcessAuditScreen';
import TransactionAuditScreen from './screens/TransactionAuditScreen';
import EducationScreen from './screens/EducationScreen';
import ProfileScreen from './screens/ProfileScreen';
import DashboardScreen from './screens/DashboardScreen';
import HistoryScreen from './screens/HistoryScreen';
import AffiliateScreen from './screens/AffiliateScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { Page, User } from './types';
import { storage } from './services/storage';
import { Toaster } from 'sonner';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(() => storage.getUser());

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    storage.init();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Failed to save theme to localStorage', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleAuthSuccess = () => {
    const loggedUser = storage.getUser();
    setUser(loggedUser);
    navigate('/dashboard');
  };

  const handleNavigate = (page: Page) => {
    const pageToPath: Record<string, string> = {
      home: '/',
      login: '/login',
      register: '/register',
      dashboard: '/dashboard',
      product: '/product-audit',
      process: '/process-audit',
      transaction: '/transaction-audit',
      education: '/education',
      settings: '/profile',
      history: '/history',
      affiliate: '/affiliate',
      subscription: '/subscription'
    };
    navigate(pageToPath[page] || '/');
  };

  const currentPath = location.pathname;
  const isPublicPage = ['/', '/login', '/register'].includes(currentPath);
  const isAuthPage = ['/login', '/register'].includes(currentPath);
  const isLandingPage = currentPath === '/';

  // Auth Guard
  useEffect(() => {
    const publicPaths = ['/', '/login', '/register'];
    if (!storage.getUser() && !publicPaths.includes(currentPath)) {
      navigate('/login');
    }
  }, [currentPath, navigate]);

  // Map path to Page type
  const pathToPage = (path: string): Page => {
    const mapping: Record<string, Page> = {
      '/': 'home',
      '/login': 'login',
      '/register': 'register',
      '/dashboard': 'dashboard',
      '/product-audit': 'product',
      '/process-audit': 'process',
      '/transaction-audit': 'transaction',
      '/education': 'education',
      '/profile': 'settings',
      '/history': 'history',
      '/affiliate': 'affiliate',
      '/subscription': 'subscription'
    };
    return mapping[path] || 'home';
  };

  if (isPublicPage) {
    return (
      <div className="min-h-screen font-sans bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Toaster position="top-center" richColors />

        {isLandingPage && (
          <LandingHeader onNavigate={handleNavigate} theme={theme} toggleTheme={toggleTheme} />
        )}

        <main>
          <Routes>
            <Route path="/" element={<HomeScreen onNavigate={handleNavigate} />} />
            <Route path="/login" element={<LoginScreen onNavigate={handleNavigate} onLoginSuccess={handleAuthSuccess} />} />
            <Route path="/register" element={<RegisterScreen onNavigate={handleNavigate} onRegisterSuccess={handleAuthSuccess} />} />
          </Routes>
        </main>
      </div>
    );
  }

  const currentPage = pathToPage(currentPath);

  return (
    <div className="min-h-screen flex font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Toaster position="top-center" richColors />

      <AppSidebar currentPage={currentPage} onNavigate={handleNavigate} />

      <div className="flex-grow flex flex-col h-screen overflow-hidden">
        <AppTopbar currentPage={currentPage} theme={theme} toggleTheme={toggleTheme} onNavigate={handleNavigate} />

        <main className="flex-grow overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/dashboard" element={<DashboardScreen onNavigate={handleNavigate} />} />
              <Route path="/product-audit" element={<ProductAuditScreen />} />
              <Route path="/process-audit" element={<ProcessAuditScreen />} />
              <Route path="/transaction-audit" element={<TransactionAuditScreen />} />
              <Route path="/education" element={<EducationScreen />} />
              <Route path="/profile" element={<ProfileScreen theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/history" element={<HistoryScreen selectedId={null} />} />
              <Route path="/affiliate" element={<AffiliateScreen />} />
              <Route path="/subscription" element={<SubscriptionScreen />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      <MobileBottomBar currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;