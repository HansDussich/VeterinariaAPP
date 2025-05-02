import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, User, MoreVertical } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExtendedBadge } from '@/components/ui/extended-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const API_BASE_URL = 'https://localhost:7290';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/MostrarClientes`);
      setClients(response.data.map((client: any) => ({
        id: client.clienteId.toString(),
        name: `${client.nombre} ${client.apellido}`,
        email: client.correo,
        phone: client.telefono
      })));
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      // Validar campos requeridos
      const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }

      const clientData = {
        nombre: formData.get('firstName'),
        apellido: formData.get('lastName'),
        correo: formData.get('email'),
        telefono: formData.get('phone'),
        contraseña: formData.get('password')
      };

      console.log('Enviando datos:', clientData);

      const response = await axios.post(`${API_BASE_URL}/Guardar`, clientData);

      console.log('Respuesta:', response.data);

      if (response.status === 200) {
        await fetchClients();
        setIsDialogOpen(false);
        
        toast({
          title: 'Cliente registrado',
          description: 'El cliente ha sido registrado exitosamente.',
        });
      } else {
        throw new Error(response.data || 'Error al registrar el cliente');
      }
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo registrar el cliente',
        variant: 'destructive',
      });
    }
  };

  const handleEditClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClient) return;

    const formData = new FormData(e.currentTarget);

    try {
      // Validar campos requeridos
      const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }

      const clientData = {
        clienteId: parseInt(selectedClient.id),
        nombre: formData.get('firstName'),
        apellido: formData.get('lastName'),
        correo: formData.get('email'),
        telefono: formData.get('phone')
      };

      console.log('Enviando datos de actualización:', clientData);

      const response = await axios.put(`${API_BASE_URL}/ActualizarCliente`, clientData);

      if (response.status === 200) {
        setIsEditDialogOpen(false);
        setSelectedClient(null);
        toast({
          title: 'Cliente actualizado',
          description: 'El cliente ha sido actualizado exitosamente.',
        });
        await fetchClients();
      } else {
        throw new Error(response.data?.message || 'Error al actualizar el cliente');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      
      let errorMessage = 'No se pudo actualizar el cliente';
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

  const handleDeactivateClient = async (client: Client) => {
    if (!window.confirm(`¿Está seguro que desea eliminar a ${client.name}?`)) {
      return;
    }

    try {
      const url = `${API_BASE_URL}/EliminarCliente`;
      
      console.log('Attempting to delete client with ID:', client.id);
      
      const response = await axios.delete(`${url}?id=${parseInt(client.id)}`);
      console.log('Delete response:', response);

      if (response.data === 'ok') {
        toast({
          title: 'Cliente eliminado',
          description: `${client.name} ha sido eliminado exitosamente.`,
        });
        await fetchClients();
      } else {
        throw new Error(response.data || 'Error al eliminar el cliente');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      
      let errorMessage = 'No se pudo eliminar el cliente';
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

  // Filtrar clientes por término de búsqueda
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleCreateClient}>
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Complete el formulario para registrar un nuevo cliente.
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
                <Button type="submit">Registrar Cliente</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : isMobile ? (
        <div className="space-y-4">
          {filteredClients.map(client => (
            <Card key={client.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedClient(client);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeactivateClient(client)}
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{client.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teléfono:</span>
                    <span>{client.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell>{client.id}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {client.name}
                      </div>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedClient(client);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeactivateClient(client)}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleEditClient}>
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Modifique los datos del cliente.
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
                    defaultValue={selectedClient?.name.split(' ')[0]}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Apellido"
                    defaultValue={selectedClient?.name.split(' ')[1]}
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
                  defaultValue={selectedClient?.email}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="123-456-7890"
                  defaultValue={selectedClient?.phone}
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

export default Clients;
