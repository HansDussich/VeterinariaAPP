import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Provider {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  correo: string;
}

const Providers = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState<Omit<Provider, 'id'>>({ 
    nombre: '',
    direccion: '',
    telefono: '',
    correo: ''
  });

  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      const response = await fetch('https://localhost:7290/ListarProveedores');
      if (!response.ok) throw new Error('Error al cargar proveedores');
      const data = await response.json();
      // Mapear el id correctamente desde ProveedorId
      setProviders(data.map((prov: any) => ({
        id: prov.proveedorId?.toString() ?? '',
        nombre: prov.nombre ?? '',
        direccion: prov.direccion ?? '',
        telefono: prov.telefono ?? '',
        correo: prov.correo ?? ''
      })));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los proveedores',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isEditing
        ? 'https://localhost:7290/PostProveedor'
        : 'https://localhost:7290/GuardarProveedore';

      const bodyData = isEditing
        ? { ...formData, proveedorId: editingProviderId ? parseInt(editingProviderId) : undefined }
        : formData;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) throw new Error('Error en la operación');

      toast({
        title: 'Éxito',
        description: `Proveedor ${isEditing ? 'actualizado' : 'creado'} correctamente`,
      });

      setIsDialogOpen(false);
      resetForm();
      fetchProviders();
    } catch (error) {
      toast({
        title: 'Error',
        description: `No se pudo ${isEditing ? 'actualizar' : 'crear'} el proveedor`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (provider: Provider) => {
    setFormData({
      nombre: provider.nombre,
      direccion: provider.direccion,
      telefono: provider.telefono,
      correo: provider.correo
    });
    setEditingProviderId(provider.id); // id ya es string
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      correo: ''
    });
    setEditingProviderId(null);
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    if (!id || id.trim() === '') {
      toast({
        title: 'Error',
        description: 'ID de proveedor inválido',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('¿Está seguro de eliminar este proveedor?')) return;

    try {
      const response = await fetch(`https://localhost:7290/EliminarProveedore/${parseInt(id)}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar');

      toast({
        title: 'Éxito',
        description: 'Proveedor eliminado correctamente',
      });

      fetchProviders();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el proveedor',
        variant: 'destructive',
      });
    }
  };



  const filteredProviders = providers.filter(provider =>
    provider.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Proveedores</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
        </Button>
      </div>

      <div className="flex justify-end">
        <Input
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProviders.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell>{provider.nombre}</TableCell>
                <TableCell>{provider.telefono}</TableCell>
                <TableCell>{provider.correo}</TableCell>
                <TableCell>{provider.direccion}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(provider)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(provider.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifique los datos del proveedor' : 'Complete los datos para registrar un nuevo proveedor'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Providers;