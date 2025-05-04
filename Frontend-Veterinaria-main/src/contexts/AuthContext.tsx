import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  hasFeatureAccess: (feature: 'billing_view' | 'billing_create' | 'billing_payment' | 'financial_stats' | 'medical_diagnosis' | 'products_pricing') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in via localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Enviamos los parámetros en la URL
      const response = await fetch(`https://localhost:7290/api/usuarios/login?nombreUsuario=${encodeURIComponent(username)}&contraseña=${encodeURIComponent(password)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const user = data.user;
      
        const formattedUser: User = {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
        };
        
        setCurrentUser(formattedUser);
        localStorage.setItem('currentUser', JSON.stringify(formattedUser));
        toast({
          title: '¡Bienvenido!',
          description: `Has iniciado sesión como ${formattedUser.name}.`,
        });
        setIsLoading(false);
        return true;
      }
      
      toast({
        title: 'Error de inicio de sesión',
        description: 'Usuario o contraseña incorrectos.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error de conexión:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado la sesión correctamente.',
    });
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!currentUser) return false;
    return requiredRoles.includes(currentUser.role);
  };

  // Sistema de permisos por características específicas según el rol
  const hasFeatureAccess = (feature: 'billing_view' | 'billing_create' | 'billing_payment' | 'financial_stats' | 'medical_diagnosis' | 'products_pricing'): boolean => {
    if (!currentUser) return false;
    
    const accessMap = {
      // Ver facturación (admin y recepcionista)
      billing_view: ['Admin', 'Recepcionista'],
      
      // Crear facturas (solo recepcionista y admin)
      billing_create: ['Admin', 'Recepcionista'],
      
      // Registrar pagos (solo recepcionista y admin)
      billing_payment: ['Admin', 'Recepcionista'],
      
      // Ver estadísticas financieras (solo admin)
      financial_stats: ['Admin'],
      
      // Registrar diagnóstico médico (veterinario y admin)
      medical_diagnosis: ['Admin', 'Veterinario'],
      
      // Ver precios de productos y servicios (admin y recepcionista)
      products_pricing: ['Admin', 'Recepcionista']
    };
    
    return accessMap[feature]?.includes(currentUser.role) || false;
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, hasPermission, hasFeatureAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
