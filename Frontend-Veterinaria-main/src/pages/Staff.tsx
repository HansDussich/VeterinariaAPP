
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, User, Mail, Phone, Calendar, Pencil, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ExtendedBadge } from '@/components/ui/extended-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import axios from 'axios'; // Added axios

const API_BASE_URL = 'https://localhost:7290'; // Added API_BASE_URL

// Define la interfaz para un miembro del personal
interface StaffMember {
  empleadoId: number;
  nombre: string;
  cargo: string;
  correo: string;
  telefono: string;
  especialidad?: string;
  estado: 'activo' | 'inactivo';
}

// Define la interfaz para el horario
interface Schedule {
  [key: string]: { active: boolean; start: string; end: string };
}

const getRoleName = (role: string) => {
  switch (role) {
    
    case 'recepcionista': return 'Recepcionista';
    case 'admin': return 'Administrador';
    default: return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

const Staff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [isNewStaffDialogOpen, setIsNewStaffDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [staffForm, setStaffForm] = useState({
    name: '',
    apellido: '',
    cargo: '',
    email: '',
    phone: '',
      contraseña: '',
    status: 'activo'
  });

  const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const initialSchedule = weekdays.reduce((acc, day) => {
    acc[day.toLowerCase()] = { active: false, start: '08:00', end: '18:00' };
    return acc;
  }, {});

  const [scheduleForm, setScheduleForm] = useState<Schedule>(initialSchedule);

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  useEffect(() => {
    const fetchStaffMembers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/ListarEmpleados`);
        const mappedData = response.data.map((emp: any) => ({
          empleadoId: emp.empleadoId,
          nombre: emp.nombre || '',
  cargo: emp.cargo?.toLowerCase() || 'desconocido',
  correo: emp.correo || '',
          telefono: emp.telefono || '',
          
          estado: emp.estado?.toLowerCase() === 'activo' ? 'activo' : 'inactivo',
        }));
        setStaffMembers(mappedData);
      } catch (error) {
        console.error("Error fetching staff members:", error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los empleados. Verifica la consola para más detalles.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffMembers();
  }, [toast]);

  const filteredStaff = staffMembers.filter(staff => {
  const nombre = String(staff.nombre || '');
  const correo = String(staff.correo || '');
  const cargo = String(staff.cargo || '');
  return (
    (nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (correo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cargo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
});

  const getRoleName = (role: string) => {
    switch (role) {
      
      case 'recepcionista': return 'Recepcionista';
      case 'admin': return 'Administrador';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const handleEdit = (staff: StaffMember) => {
    setStaffForm({
      name: staff.nombre.split(' ')[0] || '',
      apellido: staff.nombre.split(' ')[1] || '',
      cargo: staff.cargo,
      email: staff.correo,
      phone: staff.telefono,
      contraseña: '',
      status: staff.estado
    });
    setSelectedStaff(staff);
    setIsNewStaffDialogOpen(true);
  };

  const handleDelete = async (empleadoId: number) => {
    if (!confirm('¿Está seguro de eliminar este empleado?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/EliminarEmpleado/${empleadoId}`);
      setStaffMembers(staffMembers.filter(staff => staff.empleadoId !== empleadoId));
      toast({
        title: 'Éxito',
        description: 'Empleado eliminado correctamente'
      });
    } catch (error) {
      console.error('Error deleting staff member:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el empleado',
        variant: 'destructive'
      });
    }
  };

  const handleSaveNewStaff = async () => {
    const phonePattern = /^[0-9]{7,10}$/;
    const staffPayload = {
      nombre: staffForm.name,
      apellido: staffForm.apellido,
      cargo: staffForm.cargo,
      correo: staffForm.email,
      telefono: staffForm.phone,
      contraseña: staffForm.contraseña,
      estado: staffForm.status
    };

    try {
      let response;
      if (selectedStaff) {
        // Actualizar empleado existente
        response = await axios.put(`${API_BASE_URL}/ActualizarEmpleado`, {
          ...staffPayload,
          empleadoId: selectedStaff.empleadoId
        });
        
        // Actualizar la lista de empleados
        setStaffMembers(staffMembers.map(staff => 
          staff.empleadoId === selectedStaff.empleadoId
            ? {
                empleadoId: selectedStaff.empleadoId,
                nombre: `${staffForm.name} ${staffForm.apellido}`,
                cargo: staffForm.cargo.toLowerCase(),
                correo: staffForm.email,
                telefono: staffForm.phone,
                estado: staffForm.status
              }
            : staff
        ));

        toast({
          title: "Empleado actualizado",
          description: `Los datos del empleado han sido actualizados correctamente.`
        });
      } else {
        // Crear nuevo empleado
        response = await axios.post(`${API_BASE_URL}/GuardarEmpleado`, staffPayload);
        const newStaff = {
          empleadoId: response.data.empleadoId,
          nombre: `${staffForm.name} ${staffForm.apellido}`,
          cargo: staffForm.cargo.toLowerCase(),
          correo: staffForm.email,
          telefono: staffForm.phone,
          estado: 'activo'
        };
        setStaffMembers([...staffMembers, newStaff]);

        toast({
          title: "Empleado agregado",
          description: `${response.data.nombre} ha sido añadido al personal.`
        });
      }

      setIsNewStaffDialogOpen(false);
      setSelectedStaff(null);
      setStaffForm({
        name: '',
        apellido: '',
        cargo: '',
        email: '',
        phone: '',
        contraseña: '',
        status: 'activo'
      });

    } catch (error) {
      console.error("Error al procesar empleado:", error);
      const errorMessage = error.response?.data?.message || 
        `No se pudo ${selectedStaff ? 'actualizar' : 'agregar'} el empleado. Verifique los datos e intente de nuevo.`;
      toast({
        title: `Error al ${selectedStaff ? 'actualizar' : 'crear'} empleado`,
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <Dialog open={isNewStaffDialogOpen} onOpenChange={setIsNewStaffDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedStaff ? 'Editar' : 'Nuevo'} Miembro del Personal</DialogTitle>
            <DialogDescription>
              Complete todos los campos obligatorios (*) para {selectedStaff ? 'actualizar' : 'agregar'} un miembro del personal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-4 py-4">
            {/* Sección Información Personal */}
            <div className="col-span-4 space-y-4 border-b pb-4">
              <h3 className="text-sm font-medium">Información Personal</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input id="name" value={staffForm.name} onChange={(e) => setStaffForm({...staffForm, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input id="apellido" value={staffForm.apellido} onChange={(e) => setStaffForm({...staffForm, apellido: e.target.value})} />
                </div>
              </div>
            </div>
          
            {/* Sección Datos Laborales */}
            <div className="col-span-4 space-y-4 border-b pb-4">
              <h3 className="text-sm font-medium">Datos Laborales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo *</Label>
                  <Select 
                    value={staffForm.cargo}
                    onValueChange={(value) => setStaffForm({...staffForm, cargo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recepcionista">Recepcionista</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="turno">Turno <span className="text-red-500">*</span></Label>
                  <Select value={staffForm.turno} onValueChange={(value) => setStaffForm({...staffForm, turno: value})}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Seleccionar turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mañana">Mañana</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento <span className="text-red-500">*</span></Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={staffForm.fechaNacimiento}
                    onChange={(e) => setStaffForm({...staffForm, fechaNacimiento: e.target.value})}
                    className="h-8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaIngreso">Fecha de Ingreso <span className="text-red-500">*</span></Label>
                  <Input
                    id="fechaIngreso"
                    type="datetime-local"
                    value={staffForm.fechaIngreso}
                    onChange={(e) => setStaffForm({...staffForm, fechaIngreso: e.target.value})}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          
            {/* Sección Contacto */}
            <div className="col-span-4 space-y-4 pb-4">
              <h3 className="text-sm font-medium">Información de Contacto</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" value={staffForm.email} onChange={(e) => setStaffForm({...staffForm, email: e.target.value})} className="h-8" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono <span className="text-red-500">*</span></Label>
                  <Input id="phone" value={staffForm.phone} onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})} className="h-8" />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" onClick={handleSaveNewStaff}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Personal</CardTitle>
          <Button onClick={() => setIsNewStaffDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Agregar
          </Button>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Puesto</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staff) => (
                <TableRow key={staff.empleadoId}>
                  <TableCell>{staff.nombre}</TableCell>
                  <TableCell>{getRoleName(staff.cargo)}</TableCell>
                  <TableCell>{staff.correo}</TableCell>
                  <TableCell>{staff.telefono}</TableCell>
                  <TableCell>{staff.estado}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(staff)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(staff.empleadoId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Staff;
