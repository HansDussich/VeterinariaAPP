
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, Package, DollarSign } from 'lucide-react';
import { PawIcon } from '@/components/icons/PawIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const API_BASE_URL = 'https://localhost:7290';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const today = new Date();
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [appointmentsRes, petsRes, productsRes, employeesRes, veterinariansRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/ListarCitas`),
          axios.get(`${API_BASE_URL}/ListarMascotas`),
          axios.get(`${API_BASE_URL}/ListarProductos`),
          axios.get(`${API_BASE_URL}/ListarEmpleados`),
          axios.get(`${API_BASE_URL}/ListarVeterinarios`)
        ]);


        // Procesar citas
        const processedAppointments = appointmentsRes.data.map(cita => ({
          id: cita.citaId?.toString(),
          petId: cita.mascotaId?.toString(),
          date: cita.fechaCita ? new Date(cita.fechaCita).toISOString().split('T')[0] : '',
          status: cita.estado?.toLowerCase() === 'completada' ? 'completed' : 
                 cita.estado?.toLowerCase() === 'cancelada' ? 'cancelled' : 'scheduled',
          veterinarianId: cita.veterinarioId?.toString()
        }));
        setAppointments(processedAppointments);

        // Procesar mascotas y calcular clientes únicos
        const processedPets = petsRes.data;
        setPets(processedPets);
        
        // Procesar productos y calcular stock bajo
        const processedProducts = productsRes.data;
        setProducts(processedProducts);
        
        // Procesar empleados y calcular personal activo
        const processedEmployees = employeesRes.data;
        setEmployees(processedEmployees);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos del dashboard',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calcular citas para hoy
  const todayAppointments = appointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    return appointment.date === today;
  });

  // Calcular citas pendientes según el rol
  const pendingAppointments = appointments.filter(appointment => {
    if (currentUser?.role?.toLowerCase() === 'veterinario') {
      return appointment.veterinarianId === currentUser.id && appointment.status === 'scheduled';
    }
    return appointment.status === 'scheduled';
  });

  // Calcular citas completadas hoy
  const completedTodayAppointments = appointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    return appointment.date === today && appointment.status === 'completed';
  });

  // Calcular cantidad de clientes únicos
  const clientCount = pets.reduce((count, pet) => {
    const clientId = pet.clienteId?.toString();
    return clientId && !count.includes(clientId) ? [...count, clientId] : count;
  }, [] as string[]).length;

  // Calcular personal activo
  const activeStaffCount = employees.filter(employee => 
    employee.estado?.toLowerCase() === 'activo'
  ).length;

  // Calcular veterinarios activos
  const activeVeterinarians = employees.filter(employee => 
    employee.estado?.toLowerCase() === 'activo' && 
    employee.rol?.toLowerCase() === 'veterinario'
  ).length;

  // Calcular productos con stock bajo
  const lowStockProducts = products.filter(product => 
    (product.stock !== undefined && product.stock < 10) || 
    (product.cantidad !== undefined && product.cantidad < 10)
  );

  // Calcular facturas pendientes (simulado por ahora)
  const pendingInvoices = appointments.filter(appointment =>
    appointment.status === 'completed' && !appointment.isPaid
  ).length;

  // Calcular tasa de completado de citas del día
  const appointmentCompletionRate = todayAppointments.length > 0 
    ? Math.round((completedTodayAppointments.length / todayAppointments.length) * 100)
    : 0;

  // Cards to display based on user role
  const getCards = () => {
    const baseCards = [
      {
        title: 'Citas Programadas',
        value: pendingAppointments.length,
        description: 'Total de citas programadas',
        icon: Calendar,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
        roles: ['admin', 'veterinarian', 'receptionist'],
      },
      {
        title: 'Citas Completadas',
        value: `${appointmentCompletionRate}%`,
        description: 'Tasa de completado de hoy',
        icon: Clock,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        roles: ['admin', 'veterinarian', 'receptionist'],
      },
      {
        title: 'Citas Pendientes',
        value: pendingAppointments.length,
        description: 'Citas que requieren atención',
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        roles: ['admin', 'veterinarian', 'receptionist'],
      },
      {
        title: 'Personal Activo',
        value: activeStaffCount,
        description: 'Empleados en servicio',
        icon: Users,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-50',
        roles: ['admin'],
      },
      {
        title: 'Veterinarios Activos',
        value: activeVeterinarians,
        description: 'Veterinarios en servicio',
        icon: Users,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        roles: ['admin'],
      },
      {
        title: 'Facturas Pendientes',
        value: pendingInvoices,
        description: 'Facturas por cobrar',
        icon: DollarSign,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        roles: ['admin', 'receptionist'],
      },
      {
        title: 'Mascotas Registradas',
        value: pets.length,
        description: 'Total de mascotas en el sistema',
        icon: PawIcon,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        roles: ['admin', 'veterinarian', 'receptionist'],
      },
      {
        title: 'Clientes',
        value: clientCount,
        description: 'Total de clientes registrados',
        icon: Users,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        roles: ['admin', 'receptionist'],
      },
      {
        title: 'Productos con Stock Bajo',
        value: lowStockProducts.length,
        description: 'Productos que necesitan reabastecimiento',
        icon: Package,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        roles: ['admin', 'receptionist'],
      },
      {
        title: 'Ingresos Mensuales',
        value: '$5,240',
        description: 'Ingresos estimados para este mes',
        icon: DollarSign,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-50',
        roles: ['admin'],
      },
    ];

    // Filter cards based on user role
    if (!currentUser) return [];
    return baseCards.filter(card => card.roles.includes(currentUser.role));
  };

  // Cards for client dashboard
  const getClientCards = () => {
    const clientPets = pets.filter(pet => currentUser && pet.clienteId?.toString() === currentUser.id);
    const clientAppointments = appointments.filter(appointment => {
      return clientPets.some(pet => pet.mascotaId?.toString() === appointment.petId) && 
             appointment.status === 'scheduled';
    });

    return [
      {
        title: 'Tus Mascotas',
        value: clientPets.length,
        description: 'Total de mascotas registradas',
        icon: PawIcon,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
      },
      {
        title: 'Próximas Citas',
        value: clientAppointments.length,
        description: 'Citas programadas',
        icon: Calendar,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50',
      },
    ];
  };

  // Get appropriate cards based on user role
  const dashboardCards = currentUser?.role === 'client' ? getClientCards() : getCards();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          {today.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`${card.bgColor} ${card.color} p-2 rounded-full`}>
                {card.icon === PawIcon ? (
                  <PawIcon className="h-4 w-4" />
                ) : (
                  <card.icon className="h-4 w-4" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Welcome message based on user role */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Bienvenido, {currentUser?.name}</CardTitle>
          <CardDescription>
            {currentUser?.role === 'admin' && "Tienes acceso completo al sistema de gestión veterinaria."}
            {currentUser?.role === 'veterinarian' && "Puedes ver tus citas programadas y gestionar historiales médicos."}
            {currentUser?.role === 'receptionist' && "Puedes gestionar citas, clientes y productos."}
            {currentUser?.role === 'client' && "Puedes ver tus mascotas y gestionar tus citas."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Este panel te proporciona una visión general de la actividad en la clínica veterinaria. Utiliza el menú lateral para navegar a las diferentes secciones del sistema.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
