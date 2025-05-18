import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, FileText, Check, X, DollarSign, Settings, Trash2 } from 'lucide-react';
import { UserIcon } from 'lucide-react';
import { PawIcon } from '@/components/icons/PawIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment, Pet, User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ExtendedBadge } from '@/components/ui/extended-badge';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const API_BASE_URL = 'https://localhost:7290';

const Appointments = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [veterinarians, setVeterinarians] = useState<User[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConsultationDialogOpen, setIsConsultationDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/ListarCitas`);
        console.log('Initial appointments load:', response.data); // Debug log
        
        setAppointments(response.data.map((cita: any) => ({
          id: cita.citaId?.toString() || '',
          petId: cita.mascotaId?.toString() || '',
          date: cita.fechaCita ? new Date(cita.fechaCita).toISOString().split('T')[0] : '',
          time: cita.fechaCita ? new Date(cita.fechaCita).toLocaleTimeString() : '',
          reason: cita.motivo || '',
          status: normalizeStatus(cita.estado || 'PROGRAMADA'),
          veterinarianId: cita.veterinarioId?.toString() || ''
        })));
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las citas',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Fetch pets
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/ListarMascotas`);
        setPets(response.data.map((mascota: any) => ({
          id: mascota.mascotaId.toString(),
          name: mascota.nombre,
          species: mascota.tipo,
          breed: mascota.raza,
          age: calculateAge(mascota.fechaNacimiento),
          weight: 0,
          ownerId: mascota.clienteId?.toString() || '',
          gender: mascota.genero,
          birthDate: mascota.fechaNacimiento,
          status: mascota.estado
        })));
      } catch (error) {
        console.error('Error fetching pets:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las mascotas',
          variant: 'destructive',
        });
      }
    };

    fetchPets();
  }, []);

  // Fetch veterinarians
  useEffect(() => {
    const fetchVeterinarians = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/ListarVeterinarios`);
        setVeterinarians(response.data.map((vet: any) => ({
          id: vet.empleadoId.toString(),
          name: vet.nombre,
          email: vet.correo,
          role: 'Veterinario',
          status: vet.estado || 'Activo'
        })));
      } catch (error) {
        console.error('Error fetching veterinarians:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los veterinarios',
          variant: 'destructive',
        });
      }
    };

    fetchVeterinarians();
  }, []);

  const availablePets = currentUser?.role === 'Cliente' 
    ? pets.filter(pet => pet.ownerId === currentUser.id && pet.status === 'Activo')
    : pets.filter(pet => pet.status === 'Activo');

  const filteredAppointments = appointments.filter(appointment => {
    let roleFilter = true;
    
    if (currentUser?.role === 'Veterinario') {
      roleFilter = appointment.veterinarianId === currentUser.id;
      return roleFilter; // Solo aplicamos el filtro por veterinario
    } else if (currentUser?.role === 'Cliente') {
      const userPets = availablePets.map(pet => pet.id);
      roleFilter = userPets.includes(appointment.petId);
    }
    
    const dateFilter = selectedDate ? appointment.date === selectedDate.toISOString().split('T')[0] : true;
    
    return roleFilter && dateFilter;
  });

  const getPetName = (petId: string): string => {
    const pet = pets.find(pet => pet.id === petId);
    return pet ? pet.name : 'Mascota no encontrada';
  };

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/MostrarClientes`);
        setClients(response.data.map((client: any) => ({
          id: client.clienteId.toString(),
          name: `${client.nombre} ${client.apellido}`
        })));
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los clientes',
          variant: 'destructive',
        });
      }
    };

    fetchClients();
  }, []);

  const getPetOwnerName = (petId: string): string => {
    const pet = pets.find(pet => pet.id === petId);
    if (!pet) return 'Propietario no encontrado';
    
    if (currentUser?.role === 'Cliente') {
      return currentUser.name;
    }
    
    const client = clients.find(client => client.id === pet.ownerId);
    return client ? client.name : `Cliente #${pet.ownerId}`;
  };

  const getVeterinarianName = (vetId: string): string => {
    const vet = veterinarians.find(vet => vet.id === vetId);
    return vet ? vet.name : 'Veterinario no encontrado';
  };

  const handleStatusChange = async (appointmentId: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      // Mapear los estados del frontend a los estados del backend
      const backendStatus = {
        'scheduled': 'PROGRAMADA',
        'completed': 'COMPLETADA',
        'cancelled': 'CANCELADA'
      }[newStatus];

      // Obtener la cita actual antes de actualizarla
      const currentAppointment = appointments.find(app => app.id === appointmentId);
      if (!currentAppointment) {
        throw new Error('No se encontró la cita');
      }

      const response = await axios.put(`${API_BASE_URL}/ActualizarCita`, {
        citaId: parseInt(appointmentId),
        mascotaId: parseInt(currentAppointment.petId),
        veterinarioId: parseInt(currentAppointment.veterinarianId),
        fechaCita: new Date(currentAppointment.date + 'T' + currentAppointment.time).toISOString(),
        motivo: currentAppointment.reason,
        estado: backendStatus
      });

      console.log('Response from backend:', response.data); // Debug log

      if (response.data && (typeof response.data === 'string' ? response.data.includes('exitosamente') : true)) {
        // Mantener todos los datos de la cita y solo actualizar el estado
        setAppointments(prevAppointments => 
          prevAppointments.map(appointment => 
            appointment.id === appointmentId 
              ? { 
                  ...appointment,
                  status: newStatus,
                  date: appointment.date,
                  time: appointment.time,
                  petId: appointment.petId,
                  veterinarianId: appointment.veterinarianId,
                  reason: appointment.reason
                } 
              : appointment
          )
        );
        
        toast({
          title: 'Estado actualizado',
          description: `La cita ha sido marcada como ${
            newStatus === 'scheduled' ? 'programada' : 
            newStatus === 'completed' ? 'completada' : 
            'cancelada'
          }.`,
        });

        // Recargar las citas después de un breve retraso para asegurar que el backend se actualizó
        setTimeout(async () => {
          try {
            const refreshResponse = await axios.get(`${API_BASE_URL}/ListarCitas`);
            console.log('Refresh response:', refreshResponse.data); // Debug log
            
            setAppointments(refreshResponse.data.map((cita: any) => ({
              id: cita.citaId?.toString() || '',
              petId: cita.mascotaId?.toString() || '',
              date: cita.fechaCita ? new Date(cita.fechaCita).toISOString().split('T')[0] : '',
              time: cita.fechaCita ? new Date(cita.fechaCita).toLocaleTimeString() : '',
              reason: cita.motivo || '',
              status: normalizeStatus(cita.estado || 'PROGRAMADA'),
              veterinarianId: cita.veterinarioId?.toString() || ''
            })));
          } catch (error) {
            console.error('Error refreshing appointments:', error);
          }
        }, 500); // Esperar 500ms antes de recargar
      } else {
        throw new Error('No se pudo actualizar el estado de la cita');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el estado de la cita',
        variant: 'destructive',
      });
    }
  };

  // Función para convertir el estado del backend al formato del frontend
  const normalizeStatus = (backendStatus: string): 'scheduled' | 'completed' | 'cancelled' => {
    const statusMap: { [key: string]: 'scheduled' | 'completed' | 'cancelled' } = {
      'PROGRAMADA': 'scheduled',
      'COMPLETADA': 'completed',
      'CANCELADA': 'cancelled'
    };
    return statusMap[backendStatus.toUpperCase()] || 'scheduled';
  };

  const handleCreateAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      // Validate required fields
      if (!selectedDate) {
        throw new Error('Debe seleccionar una fecha');
      }

      const time = formData.get('time');
      if (!time) {
        throw new Error('Debe seleccionar una hora');
      }

      const appointmentData = {
        mascotaId: parseInt(formData.get('pet') as string),
        veterinarioId: parseInt(formData.get('veterinarian') as string),
        fechaCita: `${selectedDate.toISOString().split('T')[0]}T${time}`,
        motivo: formData.get('reason'),
        estado: 'PROGRAMADA',
        confirmada: true
      };

      console.log('Enviando datos:', appointmentData);

      const response = await axios.post(`${API_BASE_URL}/GuardarCita`, appointmentData);

      console.log('Respuesta:', response.data);

      if (response.data && (typeof response.data === 'string' ? response.data.includes('exitosamente') : true)) {
        // Create a new appointment object with the data we sent
        const newAppointment: Appointment = {
          id: new Date().getTime().toString(), // Temporary ID until we refresh
          petId: appointmentData.mascotaId.toString(),
          veterinarianId: appointmentData.veterinarioId.toString(),
          date: selectedDate.toISOString().split('T')[0],
          time: time as string,
          reason: appointmentData.motivo as string,
          status: 'scheduled'
        };

        setAppointments([...appointments, newAppointment]);
        setIsDialogOpen(false);
        setSelectedDate(undefined); // Reset selected date
        
        toast({
          title: 'Cita creada',
          description: `La cita ha sido programada exitosamente para el ${format(selectedDate, "PPP", { locale: es })} a las ${time}.`,
        });

        // Refresh appointments list
        const fetchAppointments = async () => {
          try {
            const refreshResponse = await axios.get(`${API_BASE_URL}/ListarCitas`);
            console.log('Refresh response:', refreshResponse.data);
            
            setAppointments(refreshResponse.data.map((cita: any) => ({
              id: cita.citaId?.toString() || '',
              petId: cita.mascotaId?.toString() || '',
              date: cita.fechaCita ? new Date(cita.fechaCita).toISOString().split('T')[0] : '',
              time: cita.fechaCita ? new Date(cita.fechaCita).toLocaleTimeString() : '',
              reason: cita.motivo || '',
              status: normalizeStatus(cita.estado || 'PROGRAMADA'),
              veterinarianId: cita.veterinarioId?.toString() || ''
            })));
          } catch (error) {
            console.error('Error refreshing appointments:', error);
          }
        };

        fetchAppointments();
      } else {
        throw new Error('No se pudo crear la cita');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear la cita',
        variant: 'destructive',
      });
    }
  };
  
  // Esquema para la validación del formulario de consulta
  const consultationSchema = z.object({
    diagnosis: z.string().min(3, "El diagnóstico es requerido"),
    treatment: z.string().min(3, "El tratamiento es requerido"),
    observations: z.string().optional(),
    cost: z.string().min(1, "El costo es requerido"),
    createInvoice: z.boolean().default(false),
  });

  // Tipo para los datos del formulario
  type ConsultationFormValues = z.infer<typeof consultationSchema>;

  // Formulario para el registro de consulta
  const consultationForm = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      diagnosis: "",
      treatment: "",
      observations: "",
      cost: "",
      createInvoice: false,
    },
  });
  
  // Manejar el envío del formulario de consulta
  const handleConsultationSubmit = (data: ConsultationFormValues) => {
    if (!selectedAppointment) return;
    
    // Actualizar el estado de la cita a completada
    handleStatusChange(selectedAppointment.id, 'completed');
    
    // Crear una factura si se seleccionó esa opción
    if (data.createInvoice) {
      // Aquí podríamos redirigir al usuario a la página de facturación o generar la factura automáticamente
      toast({
        title: 'Factura generada',
        description: `Se ha generado una factura por $${data.cost} para la consulta de ${getPetName(selectedAppointment.petId)}.`,
        variant: "success",
      });
    }
    
    // Registrar la consulta
    toast({
      title: 'Consulta registrada',
      description: `La consulta para ${getPetName(selectedAppointment.petId)} ha sido registrada exitosamente.`,
      variant: "success",
    });
    
    // Cerrar el diálogo
    setIsConsultationDialogOpen(false);
    setSelectedAppointment(null);
    consultationForm.reset();
  };

  // Abrir el diálogo para registrar una consulta
  const openConsultationDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsConsultationDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'programada':
        return 'text-blue-600';
      case 'completada':
        return 'text-green-600';
      case 'cancelada':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/EliminarCita/${appointmentId}`);
      
      if (response.data && (typeof response.data === 'string' ? response.data.includes('exitosamente') : true)) {
        // Eliminar la cita del estado local
        setAppointments(prevAppointments => 
          prevAppointments.filter(appointment => appointment.id !== appointmentId)
        );
        
        toast({
          title: 'Cita eliminada',
          description: 'La cita ha sido eliminada exitosamente.',
        });
      } else {
        throw new Error('No se pudo eliminar la cita');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar la cita',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Citas</h1>
        {(currentUser?.role === 'Admin' || currentUser?.role === 'Recepcionista' || currentUser?.role === 'Cliente') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Programar Cita
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleCreateAppointment}>
                <DialogHeader>
                  <DialogTitle>Programar Nueva Cita</DialogTitle>
                  <DialogDescription>
                    Complete el formulario para programar una nueva cita.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="pet">Mascota</Label>
                    <Select name="pet" required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione la mascota" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePets.map((pet) => (
                          <SelectItem key={pet.id} value={pet.id}>
                            <div className="flex items-center gap-2">
                              <PawIcon className="h-4 w-4" />
                              <span>{pet.name}</span>
                              <span className="text-muted-foreground">
                                ({pet.species} - {pet.breed})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(currentUser?.role as UserRole) !== 'Veterinario' && (
                    <div className="grid gap-2">
                      <Label htmlFor="veterinarian">Veterinario</Label>
                      <Select name="veterinarian" required>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione el veterinario" />
                        </SelectTrigger>
                        <SelectContent>
                          {veterinarians
                            .filter(vet => vet.status === 'Activo')
                            .map((vet) => (
                              <SelectItem key={vet.id} value={vet.id}>
                                <div className="flex items-center gap-2">
                                  <UserIcon className="h-4 w-4" />
                                  <span>Dr. {vet.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label>Fecha y Hora</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, "PPP", { locale: es })
                            ) : (
                              <span>Seleccione fecha</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                            disabled={(date) => 
                              date < new Date() || 
                              date.getDay() === 0 || // Domingo
                              date.getDay() === 6    // Sábado
                            }
                          />
                        </PopoverContent>
                      </Popover>

                      <Select name="time" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 9 }, (_, i) => i + 9).map((hour) => (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {`${hour}:00`}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="reason">Motivo de la consulta</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      placeholder="Describa el motivo de la consulta"
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Programar Cita
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtrar Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="date-filter">Filtrar por fecha</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  id="date-filter"
                  value={selectedDate?.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
                {selectedDate && (
                  <Button variant="outline" onClick={() => setSelectedDate(undefined)}>
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    {getPetName(appointment.petId)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <ExtendedBadge 
                      variant={appointment.status === 'scheduled' ? 'default' : 
                             appointment.status === 'completed' ? 'success' : 'destructive'}
                    >
                      {appointment.status === 'scheduled' ? 'Programada' : 
                       appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                    </ExtendedBadge>
                    {(currentUser?.role as UserRole) !== 'Cliente' && (
                      <>
                        <Select
                          defaultValue={appointment.status}
                          onValueChange={(value) => handleStatusChange(appointment.id, value as 'scheduled' | 'completed' | 'cancelled')}
                        >
                          <SelectTrigger className="h-8 w-auto px-2 flex items-center gap-1 text-sm">
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span>Cambiar</span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Programada</SelectItem>
                            <SelectItem value="completed">Completada</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (window.confirm('¿Está seguro que desea eliminar esta cita?')) {
                              handleDeleteAppointment(appointment.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {appointment.reason}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{new Date(appointment.date).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{appointment.time}</span>
                  </div>
                  {(currentUser?.role === 'Admin' || currentUser?.role === 'Veterinario' || currentUser?.role === 'Recepcionista') && (
                    <div className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{getPetOwnerName(appointment.petId)}</span>
                    </div>
                  )}
                  {currentUser?.role !== 'Veterinario' && (
                    <div className="flex items-center">
                      <PawIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Dr. {getVeterinarianName(appointment.veterinarianId)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  {appointment.status === 'scheduled' && currentUser?.role === 'Cliente' && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  )}
                  {appointment.status === 'scheduled' && (currentUser?.role === 'Admin' || currentUser?.role === 'Veterinario') && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1 ml-auto"
                      onClick={() => openConsultationDialog(appointment)}
                    >
                      <FileText className="h-4 w-4" />
                      Registrar consulta
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-10 text-center">
            <CalendarIcon className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">No hay citas disponibles</h3>
            <p className="text-muted-foreground mb-4">
              {selectedDate ? 'No hay citas programadas para la fecha seleccionada.' : 'No se encontraron citas que coincidan con los criterios de búsqueda.'}
            </p>
            {(currentUser?.role === 'Admin' || currentUser?.role === 'Recepcionista' || currentUser?.role === 'Cliente') && (
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Programar una cita
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Diálogo para registrar consulta */}
      <Dialog open={isConsultationDialogOpen} onOpenChange={setIsConsultationDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Registrar Consulta Médica</DialogTitle>
            <DialogDescription>
              {selectedAppointment && (
                <p>Registre la consulta para <strong>{getPetName(selectedAppointment.petId)}</strong> del día <strong>{new Date(selectedAppointment.date).toLocaleDateString('es-ES')}</strong></p>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...consultationForm}>
            <form onSubmit={consultationForm.handleSubmit(handleConsultationSubmit)} className="space-y-6">
              <FormField
                control={consultationForm.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnóstico</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ingrese el diagnóstico médico" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={consultationForm.control}
                name="treatment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tratamiento</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalle el tratamiento indicado" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={consultationForm.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observaciones adicionales" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={consultationForm.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo de la consulta</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            min="0"
                            step="0.01"
                            className="pl-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={consultationForm.control}
                  name="createInvoice"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <FormLabel>Generar factura</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsConsultationDialogOpen(false);
                    setSelectedAppointment(null);
                    consultationForm.reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar Consulta</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
