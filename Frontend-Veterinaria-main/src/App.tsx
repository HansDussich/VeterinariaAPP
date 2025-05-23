import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from '@/hooks/use-theme';

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Pets from "./pages/Pets";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Suppliers from "./pages/Providers";
import Staff from "./pages/Staff";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Billing from "./pages/Billing";
import Register from '@/pages/Register';
import Veterinarians from "./pages/Veterinarians";
import MedicalHistory from "./pages/MedicalHistory";

// Components
import { ProtectedLayout } from "./components/Layout";

const queryClient = new QueryClient();

// Combined App component with ThemeProvider
const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Cliente routes */}
              <Route element={<ProtectedLayout allowedRoles={['Cliente']} />}>
                <Route path="/my-appointments" element={<Appointments />} />
                <Route path="/my-pets" element={<Pets />} />
                <Route path="/my-settings" element={<Settings />} />
                {/* Redirect cliente dashboard */}
                <Route path="/" element={<Navigate to="/my-appointments" replace />} />
              </Route>

              {/* Staff routes (Admin, Veterinario, Recepcionista) */}
              <Route element={<ProtectedLayout allowedRoles={['Admin', 'Veterinario', 'Recepcionista']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/pets" element={<Pets />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/products" element={<Products />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/veterinarians" element={<Veterinarians />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/settings" element={<Settings />} />
                {/* Redirect staff dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
              
              {/* Routes for admin and veterinarians */}
              <Route element={<ProtectedLayout allowedRoles={['Admin', 'Veterinario']} />}>
                <Route path="/records" element={<MedicalHistory />} />
              </Route>
              
              {/* Routes for admin and receptionists */}
              <Route element={<ProtectedLayout allowedRoles={['Admin', 'Recepcionista']} />}>
                <Route path="/clients" element={<Clients />} />
                <Route path="/products" element={<Products />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/billing" element={<Billing />} />
              </Route>
              
              {/* Routes only for admin */}
              <Route element={<ProtectedLayout allowedRoles={['Admin']} />}>
                <Route path="/staff" element={<Staff />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
