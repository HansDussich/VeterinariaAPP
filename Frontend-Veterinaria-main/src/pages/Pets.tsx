import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Pet } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PawIcon } from '@/components/icons/PawIcon';
import { GenderIcon } from '@/components/icons/GenderIcon';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import axios from 'axios';
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

const Pets = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/ListarMascotas`);
      setPets(response.data.map((mascota: any) => ({
        id: mascota.mascotaId.toString(),
        name: mascota.nombre,
        species: mascota.tipo,
        breed: mascota.raza,
        age: calculateAge(mascota.fechaNacimiento),
        weight: 0, // No hay peso en el modelo actual
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
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleCreatePet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      // Validar campos requeridos
      const requiredFields = ['name', 'species', 'breed', 'birthDate', 'gender'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }

      // Formatear fecha
      const birthDate = formData.get('birthDate') as string;

      const petData = {
        clienteId: parseInt(currentUser?.id || '0'),
        nombre: formData.get('name'),
        tipo: formData.get('species'),
        raza: formData.get('breed'),
        fechaNacimiento: birthDate ? new Date(birthDate + 'T00:00:00').toISOString() : null,
        genero: formData.get('gender'),
        estado: 'Activo',
        fechaRegistro: new Date().toISOString()
      };

      console.log('Enviando datos:', petData);

      const response = await axios.post(`${API_BASE_URL}/GuardarMascota`, petData);

      console.log('Respuesta:', response.data);

      if (response.data && (typeof response.data === 'string' ? response.data.includes('exitosamente') : true)) {
        const newPet: Pet = {
          id: typeof response.data === 'string' ? '0' : response.data.mascotaId?.toString() || '0',
          name: petData.nombre as string,
          species: petData.tipo as string,
          breed: petData.raza as string,
          age: calculateAge(petData.fechaNacimiento || ''),
          weight: 0,
          ownerId: currentUser?.id || '',
          gender: petData.genero as string,
          birthDate: petData.fechaNacimiento,
          status: petData.estado
        };

        setPets([...pets, newPet]);
        setIsDialogOpen(false);
        
        toast({
          title: 'Mascota registrada',
          description: `${newPet.name} ha sido registrado exitosamente.`,
        });

        // Recargar la lista de mascotas
        await fetchPets();
      } else {
        throw new Error(typeof response.data === 'string' ? response.data : 'Error al registrar la mascota');
      }
    } catch (error) {
      console.error('Error creating pet:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo registrar la mascota',
        variant: 'destructive',
      });
    }
  };

  const handleEditPet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPet) return;

    const formData = new FormData(e.currentTarget);

    try {
      // Validar campos requeridos
      const requiredFields = ['name', 'species', 'breed', 'birthDate', 'gender'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }

      // Formatear fecha
      const birthDate = formData.get('birthDate') as string;

      const petData = {
        mascotaId: parseInt(selectedPet.id),
        clienteId: parseInt(selectedPet.ownerId),
        nombre: formData.get('name'),
        tipo: formData.get('species'),
        raza: formData.get('breed'),
        fechaNacimiento: birthDate ? new Date(birthDate + 'T00:00:00').toISOString() : null,
        genero: formData.get('gender'),
        estado: selectedPet.status,
        fechaRegistro: new Date().toISOString()
      };

      // Use the correct Spanish endpoint name
      const response = await axios.put(`${API_BASE_URL}/ActualizarMascota`, petData);

      if (response.status === 200 || response.data?.includes('exitosamente')) {
        setIsEditDialogOpen(false);
        setSelectedPet(null);
        toast({
          title: 'Mascota actualizada',
          description: `${petData.nombre} ha sido actualizado exitosamente.`,
        });
        await fetchPets();
      } else {
        throw new Error(response.data?.message || 'Error al actualizar la mascota');
      }
    } catch (error) {
      console.error('Error updating pet:', error);
      
      let errorMessage = 'No se pudo actualizar la mascota';
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

  const handleDeletePet = async (pet: Pet) => {
    if (!window.confirm(`¿Está seguro que desea desactivar a ${pet.name}?`)) {
      return;
    }

    try {
      // Use the correct Spanish endpoint name
      const url = `${API_BASE_URL}/ActualizarMascota`;
      const petData = {
        mascotaId: parseInt(pet.id),
        clienteId: parseInt(pet.ownerId),
        nombre: pet.name,
        tipo: pet.species,
        raza: pet.breed,
        fechaNacimiento: pet.birthDate,
        genero: pet.gender,
        estado: 'Inactivo', // Set status to inactive
        fechaRegistro: new Date().toISOString()
      };

      console.log('Attempting to deactivate pet with data:', petData);
      
      const response = await axios.put(url, petData);
      console.log('Deactivate response:', response);

      if (response.status === 200) {
        toast({
          title: 'Mascota desactivada',
          description: `${pet.name} ha sido marcada como inactiva.`,
        });
        await fetchPets();
      } else {
        throw new Error('Error al desactivar la mascota');
      }
    } catch (error) {
      console.error('Error deactivating pet:', error);
      
      let errorMessage = 'No se pudo desactivar la mascota';
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

  const handleReactivatePet = async (pet: Pet) => {
    if (!window.confirm(`¿Está seguro que desea reactivar a ${pet.name}?`)) {
      return;
    }

    try {
      // Use the correct Spanish endpoint name
      const url = `${API_BASE_URL}/ActualizarMascota`;
      const petData = {
        mascotaId: parseInt(pet.id),
        clienteId: parseInt(pet.ownerId),
        nombre: pet.name,
        tipo: pet.species,
        raza: pet.breed,
        fechaNacimiento: pet.birthDate,
        genero: pet.gender,
        estado: 'Activo', // Set status to active
        fechaRegistro: new Date().toISOString()
      };

      console.log('Attempting to reactivate pet with data:', petData);
      
      const response = await axios.put(url, petData);
      console.log('Reactivate response:', response);

      if (response.status === 200) {
        toast({
          title: 'Mascota reactivada',
          description: `${pet.name} ha sido marcada como activa.`,
        });
        await fetchPets();
      } else {
        throw new Error('Error al reactivar la mascota');
      }
    } catch (error) {
      console.error('Error reactivating pet:', error);
      
      let errorMessage = 'No se pudo reactivar la mascota';
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
        <h1 className="text-3xl font-bold tracking-tight">Mascotas</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive">Mostrar inactivas</Label>
          </div>
          {currentUser && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PawIcon className="mr-2 h-4 w-4" />
                  Registrar Mascota
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleCreatePet}>
                  <DialogHeader>
                    <DialogTitle>Registrar Nueva Mascota</DialogTitle>
                    <DialogDescription>
                      Complete el formulario para registrar una nueva mascota.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Nombre de la mascota"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="species">Especie</Label>
                      <Select name="species" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione la especie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Perro">Perro</SelectItem>
                          <SelectItem value="Gato">Gato</SelectItem>
                          <SelectItem value="Ave">Ave</SelectItem>
                          <SelectItem value="Roedor">Roedor</SelectItem>
                          <SelectItem value="Reptil">Reptil</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="breed">Raza</Label>
                      <Input
                        id="breed"
                        name="breed"
                        placeholder="Raza de la mascota"
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
                      <Label htmlFor="gender">Género</Label>
                      <Select name="gender" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Macho">Macho</SelectItem>
                          <SelectItem value="Hembra">Hembra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Registrar Mascota</Button>
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
        ) : pets.filter(pet => showInactive || pet.status === 'Activo').length > 0 ? (
          pets
            .filter(pet => showInactive || pet.status === 'Activo')
            .map((pet) => (
            <Card key={pet.id} className={`overflow-hidden ${pet.status === 'Inactivo' ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">
                    {pet.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={pet.status === 'Activo' ? 'default' : 'secondary'}>
                      {pet.status}
                    </Badge>
                    {(currentUser?.role === 'Admin' || currentUser?.id === pet.ownerId) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPet(pet);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            Editar
                          </DropdownMenuItem>
                          {pet.status === 'Activo' && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeletePet(pet)}
                            >
                              Desactivar
                            </DropdownMenuItem>
                          )}
                          {pet.status === 'Inactivo' && (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => handleReactivatePet(pet)}
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
                  {pet.species} - {pet.breed}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{pet.age} años</span>
                  </div>
                  <div className="flex items-center">
                    <GenderIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{pet.gender}</span>
                  </div>
                  {pet.birthDate && (
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Nacimiento: {new Date(pet.birthDate).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-10 text-center">
            <PawIcon className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">No hay mascotas registradas</h3>
            <p className="text-muted-foreground mb-4">
              {currentUser?.role === 'Cliente' 
                ? 'Registra tu primera mascota para comenzar.'
                : 'No se encontraron mascotas en el sistema.'}
            </p>
            {currentUser?.role === 'Cliente' && (
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(true)}
              >
                <PawIcon className="mr-2 h-4 w-4" />
                Registrar mascota
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleEditPet}>
            <DialogHeader>
              <DialogTitle>Editar Mascota</DialogTitle>
              <DialogDescription>
                Modifique los datos de la mascota.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nombre de la mascota"
                  defaultValue={selectedPet?.name}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="species">Especie</Label>
                <Select name="species" defaultValue={selectedPet?.species} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione la especie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Perro">Perro</SelectItem>
                    <SelectItem value="Gato">Gato</SelectItem>
                    <SelectItem value="Ave">Ave</SelectItem>
                    <SelectItem value="Roedor">Roedor</SelectItem>
                    <SelectItem value="Reptil">Reptil</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="breed">Raza</Label>
                <Input
                  id="breed"
                  name="breed"
                  placeholder="Raza de la mascota"
                  defaultValue={selectedPet?.breed}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  defaultValue={selectedPet?.birthDate ? new Date(selectedPet.birthDate).toISOString().split('T')[0] : ''}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender">Género</Label>
                <Select name="gender" defaultValue={selectedPet?.gender} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Macho">Macho</SelectItem>
                    <SelectItem value="Hembra">Hembra</SelectItem>
                  </SelectContent>
                </Select>
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

export default Pets;
