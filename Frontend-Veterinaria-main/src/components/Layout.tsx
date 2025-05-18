import React, { useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNavBar } from '@/components/MobileNavBar';
import { Calendar, PawPrint, Settings } from 'lucide-react';
import { ChatBot } from '@/components/chat/ChatBot';

interface ProtectedLayoutProps {
  allowedRoles: UserRole[];
  requiredFeature?: 'billing_view' | 'billing_create' | 'billing_payment' | 'financial_stats' | 'medical_diagnosis' | 'products_pricing';
}

const clienteNavItems = [
  {
    title: "Mis Citas",
    href: "/my-appointments",
    icon: Calendar
  },
  {
    title: "Mis Mascotas",
    href: "/my-pets",
    icon: PawPrint
  },
  {
    title: "Mi Cuenta",
    href: "/my-settings",
    icon: Settings
  }
];

const staffNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Calendar
  },
  {
    title: "Citas",
    href: "/appointments",
    icon: Calendar
  },
  {
    title: "Mascotas",
    href: "/pets",
    icon: PawPrint
  },
  {
    title: "Configuración",
    href: "/settings",
    icon: Settings
  }
];

export const Layout: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in ${isMobile ? 'pb-20' : ''}`}>
          <Outlet />
        </main>
        <MobileNavBar />
        <ChatBot />
      </div>
    </SidebarProvider>
  );
};

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ allowedRoles, requiredFeature }) => {
  const { currentUser, isLoading, hasPermission, hasFeatureAccess, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (!allowedRoles.includes(currentUser.role)) {
      // Redirect to appropriate dashboard based on role
      if (currentUser.role === 'Cliente') {
        navigate('/my-appointments');
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentUser, navigate, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  // Verificar acceso a características específicas
  if (requiredFeature && !hasFeatureAccess(requiredFeature)) {
    return <Navigate to="/" replace />;
  }

  // Determine which nav items to show based on user role
  const navItems = currentUser.role === 'Cliente' ? clienteNavItems : staffNavItems;

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in ${isMobile ? 'pb-20' : ''}`}>
          <Outlet />
        </main>
        <MobileNavBar />
        <ChatBot />
      </div>
    </SidebarProvider>
  );
};
