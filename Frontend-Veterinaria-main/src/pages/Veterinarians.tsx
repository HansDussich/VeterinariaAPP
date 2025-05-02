import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { UserIcon } from '@/components/icons/UserIcon';
import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { MailIcon } from '@/components/icons/MailIcon';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = 'https://localhost:7290';

const Veterinarians = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [veterinarians, setVeterinarians] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVet, setSelectedVet] = useState<User | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchVeterinarians();
  }, []);

  const fetchVeterinarians = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/ListarVeterinarios`);
      setVeterinarians(response.data.map((vet: any) => ({
        id: vet.empleadoId.toString(),
        name: `${vet.nombre} ${vet.apellido}`,
        email: vet.correo,
        role: 'Veterinario',
        phone: vet.telefono,
        shift: vet.turno,
        startDate: vet.fechaIngreso,
        status: vet.estado || 'Activo'
      })));
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los veterinarios',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVeterinarian = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      // Validar campos requeridos
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'shift', 'startDate', 'birthDate', 'password'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }

      // Formatear fechas
      const startDate = formData.get('startDate') as string;
      const birthDate = formData.get('birthDate') as string;

      const veterinarianData = {
        nombre: formData.get('firstName'),
        apellido: formData.get('lastName'),
        cargo: 'Veterinario',
        telefono: formData.get('phone'),
        correo: formData.get('email'),
        turno: formData.get('shift'),
        fechaIngreso: startDate ? new Date(startDate + 'T00:00:00').toISOString() : null,
        fechaNacimiento: birthDate ? new Date(birthDate + 'T00:00:00').toISOString() : null,
        contraseña: formData.get('password'),
        estado: 'Activo'
      };

      console.log('Enviando datos:', veterinarianData);

      const response = await axios.post(`${API_BASE_URL}/GuardarEmpleado`, veterinarianData);

      console.log('Respuesta:', response.data);

      if (typeof response.data === 'string' && response.data.includes('exitosamente')) {
        await fetchVeterinarians();
        setIsDialogOpen(false);
        
        toast({
          title: 'Veterinario registrado',
          description: 'El veterinario ha sido registrado exitosamente.',
        });
      } else {
        throw new Error(response.data || 'Error al registrar el veterinario');
      }
    } catch (error) {
      console.error('Error creating veterinarian:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo registrar el veterinario',
        variant: 'destructive',
      });
    }
  };

  const handleEditVeterinarian = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVet) return;

    const formData = new FormData(e.currentTarget);

    try {
      // Validar campos requeridos
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'shift', 'startDate'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }

      // Formatear fecha
      const startDate = formData.get('startDate') as string;

      const veterinarianData = {
        empleadoId: parseInt(selectedVet.id),
        nombre: formData.get('firstName'),
        apellido: formData.get('lastName'),
        cargo: 'Veterinario',
        telefono: formData.get('phone'),
        correo: formData.get('email'),
        turno: formData.get('shift'),
        fechaIngreso: startDate ? new Date(startDate + 'T00:00:00').toISOString() : null,
        estado: selectedVet.status
      };

      console.log('Enviando datos de actualización:', veterinarianData);

      const response = await axios.put(`${API_BASE_URL}/ActualizarEmpleado`, veterinarianData);

      if (response.status === 200 || response.data?.includes('exitosamente')) {
        setIsEditDialogOpen(false);
        setSelectedVet(null);
        toast({
          title: 'Veterinario actualizado',
          description: 'El veterinario ha sido actualizado exitosamente.',
        });
        await fetchVeterinarians();
      } else {
        throw new Error(response.data?.message || 'Error al actualizar el veterinario');
      }
    } catch (error) {
      console.error('Error updating veterinarian:', error);
      
      let errorMessage = 'No se pudo actualizar el veterinario';
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = error.response.data?.message || `Error del servidor: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
          errorMessage = 'No se recibió respuesta del servidor';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeactivateVeterinarian = async (vet: User) => {
    if (!window.confirm(`¿Está seguro que desea desactivar al Dr. ${vet.name}?`)) {
      return;
    }

    try {
      const url = `${API_BASE_URL}/ActualizarEmpleado`;
      const vetData = {
        empleadoId: parseInt(vet.id),
        nombre: vet.name.split(' ')[0],
        apellido: vet.name.split(' ')[1],
        cargo: 'Veterinario',
        telefono: vet.phone,
        correo: vet.email,
        turno: vet.shift,
        fechaIngreso: vet.startDate,
        estado: 'Inactivo'
      };

      console.log('Attempting to deactivate veterinarian with data:', vetData);
      
      const response = await axios.put(url, vetData);
      console.log('Deactivate response:', response);

      if (response.status === 200) {
        toast({
          title: 'Veterinario desactivado',
          description: `El Dr. ${vet.name} ha sido marcado como inactivo.`,
        });
        await fetchVeterinarians();
      } else {
        throw new Error('Error al desactivar el veterinario');
      }
    } catch (error) {
      console.error('Error deactivating veterinarian:', error);
      
      let errorMessage = 'No se pudo desactivar el veterinario';
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });

        if (error.response) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else {
            errorMessage = error.response.data?.message || `Error del servidor: ${error.response.status} - ${error.response.statusText}`;
          }
        } else if (error.request) {
          errorMessage = 'No se recibió respuesta del servidor';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleReactivateVeterinarian = async (vet: User) => {
    if (!window.confirm(`¿Está seguro que desea reactivar al Dr. ${vet.name}?`)) {
      return;
    }

    try {
      const url = `${API_BASE_URL}/ActualizarEmpleado`;
      const vetData = {
        empleadoId: parseInt(vet.id),
        nombre: vet.name.split(' ')[0],
        apellido: vet.name.split(' ')[1],
        cargo: 'Veterinario',
        telefono: vet.phone,
        correo: vet.email,
        turno: vet.shift,
        fechaIngreso: vet.startDate,
        estado: 'Activo'
      };

      console.log('Attempting to reactivate veterinarian with data:', vetData);
      
      const response = await axios.put(url, vetData);
      console.log('Reactivate response:', response);

      if (response.status === 200) {
        toast({
          title: 'Veterinario reactivado',
          description: `El Dr. ${vet.name} ha sido marcado como activo.`,
        });
        await fetchVeterinarians();
      } else {
        throw new Error('Error al reactivar el veterinario');
      }
    } catch (error) {
      console.error('Error reactivating veterinarian:', error);
      
      let errorMessage = 'No se pudo reactivar el veterinario';
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });

        if (error.response) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else {
            errorMessage = error.response.data?.message || `Error del servidor: ${error.response.status} - ${error.response.statusText}`;
          }
        } else if (error.request) {
          errorMessage = 'No se recibió respuesta del servidor';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Veterinarios</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive">Mostrar inactivos</Label>
          </div>
          {currentUser?.role === 'Admin' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Registrar Veterinario
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleCreateVeterinarian}>
                  <DialogHeader>
                    <DialogTitle>Registrar Nuevo Veterinario</DialogTitle>
                    <DialogDescription>
                      Complete el formulario para registrar un nuevo veterinario.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="Nombre"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Apellido"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="123-456-7890"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="shift">Turno</Label>
                      <Select name="shift" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el turno" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mañana">Mañana</SelectItem>
                          <SelectItem value="Tarde">Tarde</SelectItem>
                          <SelectItem value="Noche">Noche</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Fecha de Ingreso</Label>
                      <Input
                        type="date"
                        id="startDate"
                        name="startDate"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                      <Input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Registrar Veterinario</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : veterinarians.filter(vet => showInactive || vet.status === 'Activo').length > 0 ? (
          veterinarians
            .filter(vet => showInactive || vet.status === 'Activo')
            .map((vet) => (
            <Card key={vet.id} className={`overflow-hidden ${vet.status === 'Inactivo' ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    Dr. {vet.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={vet.status === 'Activo' ? 'default' : 'secondary'}>
                      {vet.status}
                    </Badge>
                    {currentUser?.role === 'Admin' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedVet(vet);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            Editar
                          </DropdownMenuItem>
                          {vet.status === 'Activo' && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeactivateVeterinarian(vet)}
                            >
                              Desactivar
                            </DropdownMenuItem>
                          )}
                          {vet.status === 'Inactivo' && (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => handleReactivateVeterinarian(vet)}
                            >
                              Reactivar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <CardDescription>
                  Veterinario
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2 text-sm">
                  {vet.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{vet.phone}</span>
                    </div>
                  )}
                  {vet.email && (
                    <div className="flex items-center">
                      <MailIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{vet.email}</span>
                    </div>
                  )}
                  {vet.startDate && (
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Ingreso: {new Date(vet.startDate).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-10 text-center">
            <UserIcon className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">No hay veterinarios registrados</h3>
            <p className="text-muted-foreground mb-4">
              {currentUser?.role === 'Admin' 
                ? 'Registra un nuevo veterinario para comenzar.'
                : 'No se encontraron veterinarios en el sistema.'}
            </p>
            {currentUser?.role === 'Admin' && (
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(true)}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Registrar veterinario
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleEditVeterinarian}>
            <DialogHeader>
              <DialogTitle>Editar Veterinario</DialogTitle>
              <DialogDescription>
                Modifique los datos del veterinario.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Nombre"
                    defaultValue={selectedVet?.name.split(' ')[0]}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Apellido"
                    defaultValue={selectedVet?.name.split(' ')[1]}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  defaultValue={selectedVet?.email}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="123-456-7890"
                  defaultValue={selectedVet?.phone}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shift">Turno</Label>
                <Select name="shift" defaultValue={selectedVet?.shift} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mañana">Mañana</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noche">Noche</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startDate">Fecha de Ingreso</Label>
                <Input
                  type="date"
                  id="startDate"
                  name="startDate"
                  defaultValue={selectedVet?.startDate ? new Date(selectedVet.startDate).toISOString().split('T')[0] : ''}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Veterinarians; 