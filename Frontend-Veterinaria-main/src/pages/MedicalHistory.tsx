import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Trash2, Eye, AlertCircle, CalendarIcon, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_BASE_URL = 'https://localhost:7290';

interface MedicalHistory {
  historialId: number;
  mascotaId: number;
  veterinarioId: number;
  fechaConsulta: string;
  diagnostico: string;
  tratamiento: string;
  notas: string;
  mascota?: {
    nombre: string;
    tipo: string;
    raza: string;
    cliente?: {
      nombre: string;
      apellido: string;
    };
  };
  veterinario?: {
    nombre: string;
    apellido: string;
    cargo: string;
  };
}

interface Pet {
  mascotaId: number;
  nombre: string;
  tipo: string;
  raza: string;
  cliente?: {
    nombre: string;
    apellido: string;
  };
}

interface Veterinarian {
  empleadoId: number;
  nombre: string;
  apellido: string;
  cargo: string;
}

const MedicalHistory: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<MedicalHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [pets, setPets] = useState<Pet[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    mascotaId: '',
    veterinarioId: '',
    fechaConsulta: '',
    diagnostico: '',
    tratamiento: '',
    notas: '',
  });

  useEffect(() => {
    fetchMedicalHistories();
    fetchPets();
    fetchVeterinarians();
    if (id) {
      setIsEditing(true);
      fetchHistory(id);
    }
  }, [id]);

  const fetchMedicalHistories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/ListarHistorialMedicos`);
      if (response.status === 200) {
        const data = Array.isArray(response.data) ? response.data : [];
        
        const historiesWithDetails = await Promise.all(
          data.map(async (history) => {
            try {
              if (!history.mascotaId || !history.veterinarioId) {
                return {
                  ...history,
                  mascota: {
                    nombre: 'N/A',
                    tipo: 'N/A',
                    raza: 'N/A',
                    cliente: null
                  },
                  veterinario: {
                    nombre: 'N/A',
                    apellido: 'N/A',
                    cargo: 'N/A'
                  }
                };
              }

              const petResponse = await axios.get(`${API_BASE_URL}/ObtenerMascotaPorId/${history.mascotaId}`);
              const petData = petResponse.data;
              
              const vetResponse = await axios.get(`${API_BASE_URL}/ObtenerEmpleadoPorId/${history.veterinarioId}`);
              const vetData = vetResponse.data;
              
              let ownerData = null;
              if (petData?.clienteId) {
                const ownerResponse = await axios.get(`${API_BASE_URL}/MostrarClientePorId?id=${petData.clienteId}`);
                ownerData = ownerResponse.data;
              }
              
              return {
                ...history,
                mascota: {
                  nombre: petData?.nombre || 'N/A',
                  tipo: petData?.tipo || 'N/A',
                  raza: petData?.raza || 'N/A',
                  cliente: ownerData ? {
                    nombre: ownerData.nombre || 'N/A',
                    apellido: ownerData.apellido || 'N/A'
                  } : null
                },
                veterinario: {
                  nombre: vetData?.nombre || 'N/A',
                  apellido: vetData?.apellido || 'N/A',
                  cargo: vetData?.cargo || 'N/A'
                }
              };
            } catch (error) {
              console.error('Error fetching related data:', error);
              return {
                ...history,
                mascota: {
                  nombre: 'N/A',
                  tipo: 'N/A',
                  raza: 'N/A',
                  cliente: null
                },
                veterinario: {
                  nombre: 'N/A',
                  apellido: 'N/A',
                  cargo: 'N/A'
                }
              };
            }
          })
        );
        
        setMedicalHistories(historiesWithDetails);
      }
    } catch (error) {
      console.error('Error fetching medical histories:', error);
      let errorMessage = 'No se pudieron cargar los historiales médicos.';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK') {
          errorMessage = 'No se pudo conectar con el servidor. Verifique que el backend esté corriendo en el puerto 7290.';
        } else if (error.response) {
          errorMessage = `Error del servidor: ${error.response.status}`;
        }
      }
      
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setMedicalHistories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ObtenerHistorialMedicoPorId/${id}`);
      const history = response.data;
      setFormData({
        mascotaId: history.mascotaId.toString(),
        veterinarioId: history.veterinarioId.toString(),
        fechaConsulta: history.fechaConsulta,
        diagnostico: history.diagnostico,
        tratamiento: history.tratamiento,
        notas: history.notas
      });
      setDate(new Date(history.fechaConsulta));
      setIsFormDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el historial médico',
        variant: 'destructive',
      });
      navigate('/medical-history');
    }
  };

  const fetchPets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ListarMascotas`);
      if (response.status === 200) {
        setPets(response.data);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las mascotas',
        variant: 'destructive',
      });
    }
  };

  const fetchVeterinarians = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ListarEmpleados`);
      if (response.status === 200) {
        const vets = response.data.filter((emp: Veterinarian) => 
          emp.cargo.toLowerCase().includes('veterinario')
        );
        setVeterinarians(vets);
      }
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los veterinarios',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (history: MedicalHistory) => {
    setSelectedHistory(history);
    setIsDeleteDialogOpen(true);
  };

  const handleView = async (history: MedicalHistory) => {
    setSelectedHistory(history);
    setIsViewDialogOpen(true);
  };

  const handleEdit = async (history: MedicalHistory) => {
    setSelectedHistory(history);
    setFormData({
      mascotaId: history.mascotaId.toString(),
      veterinarioId: history.veterinarioId.toString(),
      fechaConsulta: history.fechaConsulta,
      diagnostico: history.diagnostico || '',
      tratamiento: history.tratamiento || '',
      notas: history.notas || '',
    });
    setDate(new Date(history.fechaConsulta));
    setIsEditing(true);
    setIsFormDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedHistory) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/EliminarHistorialMedico/${selectedHistory.historialId}`);
        
        if (response.status === 200) {
          setMedicalHistories(medicalHistories.filter(h => h.historialId !== selectedHistory.historialId));
          setIsDeleteDialogOpen(false);
          setSelectedHistory(null);
          toast({
            title: 'Éxito',
            description: 'El historial médico ha sido eliminado correctamente',
          });
        } else {
          throw new Error('Error al eliminar el historial');
        }
      } catch (error) {
        console.error('Error deleting medical history:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el historial médico. Por favor, intente nuevamente.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar campos requeridos
      if (!formData.mascotaId || !formData.veterinarioId || !date) {
        toast({
          title: 'Error',
          description: 'Por favor complete todos los campos requeridos',
          variant: 'destructive',
        });
        return;
      }

      const historyData = {
        mascotaId: parseInt(formData.mascotaId),
        veterinarioId: parseInt(formData.veterinarioId),
        fechaConsulta: date.toISOString(),
        diagnostico: formData.diagnostico || '',
        tratamiento: formData.tratamiento || '',
        notas: formData.notas || '',
      };

      if (isEditing && selectedHistory) {
        await axios.put(`${API_BASE_URL}/ActualizarHistorialMedico`, {
          ...historyData,
          historialId: selectedHistory.historialId
        });
        toast({
          title: 'Éxito',
          description: 'Historial médico actualizado correctamente',
        });
      } else {
        await axios.post(`${API_BASE_URL}/GuardarHistorialMedico`, historyData);
        toast({
          title: 'Éxito',
          description: 'Historial médico creado correctamente',
        });
      }

      setIsFormDialogOpen(false);
      setFormData({
        mascotaId: '',
        veterinarioId: '',
        fechaConsulta: '',
        diagnostico: '',
        tratamiento: '',
        notas: '',
      });
      setDate(new Date());
      setIsEditing(false);
      setSelectedHistory(null);
      fetchMedicalHistories();
    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = `No se pudo ${isEditing ? 'actualizar' : 'crear'} el historial médico`;
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data || errorMessage;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredHistories = medicalHistories.filter(history => {
    const searchLower = searchTerm.toLowerCase();
    return (
      history.mascota?.nombre?.toLowerCase().includes(searchLower) ||
      history.mascota?.tipo?.toLowerCase().includes(searchLower) ||
      history.mascota?.raza?.toLowerCase().includes(searchLower) ||
      history.mascota?.cliente?.nombre?.toLowerCase().includes(searchLower) ||
      history.mascota?.cliente?.apellido?.toLowerCase().includes(searchLower) ||
      history.veterinario?.nombre?.toLowerCase().includes(searchLower) ||
      history.veterinario?.apellido?.toLowerCase().includes(searchLower) ||
      history.diagnostico?.toLowerCase().includes(searchLower) ||
      history.tratamiento?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Historial Médico</h1>
        <div className="flex items-center gap-4">
          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          <Button onClick={() => {
            setIsEditing(false);
            setSelectedHistory(null);
            setFormData({
              mascotaId: '',
              veterinarioId: '',
              fechaConsulta: '',
              diagnostico: '',
              tratamiento: '',
              notas: '',
            });
            setDate(new Date());
            setIsFormDialogOpen(true);
          }}>
            Crear Historial
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por mascota, dueño, veterinario, diagnóstico o tratamiento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Mascota</TableHead>
                <TableHead>Dueño</TableHead>
                <TableHead>Veterinario</TableHead>
                <TableHead>Fecha Consulta</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      Cargando historiales médicos...
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    <div className="flex items-center justify-center gap-2 text-destructive">
                      <AlertCircle className="h-5 w-5" />
                      {error}
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredHistories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No se encontraron historiales médicos
                  </TableCell>
                </TableRow>
              ) : (
                filteredHistories.map((history) => (
                  <TableRow key={history.historialId}>
                    <TableCell>{history.historialId}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{history.mascota?.nombre || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {history.mascota?.tipo || 'N/A'} - {history.mascota?.raza || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {history.mascota?.cliente?.nombre || 'N/A'} {history.mascota?.cliente?.apellido || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {history.veterinario?.nombre || 'N/A'} {history.veterinario?.apellido || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {history.veterinario?.cargo || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {history.fechaConsulta ? new Date(history.fechaConsulta).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{history.diagnostico || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(history)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(history)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(history)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este registro del historial médico?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Historial Médico</DialogTitle>
          </DialogHeader>
          {selectedHistory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Mascota</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedHistory.mascota?.nombre || 'N/A'} ({selectedHistory.mascota?.tipo || 'N/A'} - {selectedHistory.mascota?.raza || 'N/A'})
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Dueño</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedHistory.mascota?.cliente?.nombre || 'N/A'} {selectedHistory.mascota?.cliente?.apellido || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Veterinario</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedHistory.veterinario?.nombre || 'N/A'} {selectedHistory.veterinario?.apellido || 'N/A'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Fecha de Consulta</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedHistory.fechaConsulta ? new Date(selectedHistory.fechaConsulta).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium">Diagnóstico</h3>
                <p className="text-sm text-muted-foreground">{selectedHistory.diagnostico || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-medium">Tratamiento</h3>
                <p className="text-sm text-muted-foreground">{selectedHistory.tratamiento || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-medium">Notas</h3>
                <p className="text-sm text-muted-foreground">{selectedHistory.notas || 'N/A'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Historial Médico' : 'Crear Historial Médico'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="mascotaId">Mascota</Label>
                <Select
                  value={formData.mascotaId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, mascotaId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una mascota" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem key={pet.mascotaId} value={pet.mascotaId.toString()}>
                        {pet.nombre} ({pet.tipo} - {pet.raza})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="veterinarioId">Veterinario</Label>
                <Select
                  value={formData.veterinarioId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, veterinarioId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un veterinario" />
                  </SelectTrigger>
                  <SelectContent>
                    {veterinarians.map((vet) => (
                      <SelectItem key={vet.empleadoId} value={vet.empleadoId.toString()}>
                        {vet.nombre} {vet.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fecha de Consulta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Seleccione una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnostico">Diagnóstico</Label>
                <Input
                  id="diagnostico"
                  name="diagnostico"
                  value={formData.diagnostico}
                  onChange={handleChange}
                  placeholder="Ingrese el diagnóstico"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tratamiento">Tratamiento</Label>
                <Textarea
                  id="tratamiento"
                  name="tratamiento"
                  value={formData.tratamiento}
                  onChange={handleChange}
                  placeholder="Ingrese el tratamiento"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notas">Notas Adicionales</Label>
                <Textarea
                  id="notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  placeholder="Ingrese notas adicionales"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormDialogOpen(false);
                  setIsEditing(false);
                  setSelectedHistory(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MedicalHistory; 