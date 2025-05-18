
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, CheckIcon, CreditCard, Download, FileText, Plus, Search, XCircleIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox'; // <-- AGREGAR IMPORTACIÓN
import { useToast } from '@/hooks/use-toast';
import { ExtendedBadge } from '@/components/ui/extended-badge';
import { MonthlyReportCard } from '@/components/billing/MonthlyReportCard';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'https://localhost:7290';

const Billing = () => {
  const { toast } = useToast();
  const { hasFeatureAccess } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]); // Especificar tipo si es posible
  const [payments, setPayments] = useState<any[]>([]); // Especificar tipo si es posible
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null); // Especificar tipo si es posible
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]); // Especificar tipo si es posible
  const [productsList, setProductsList] = useState<any[]>([]); // <-- NUEVO ESTADO PARA LISTA DE PRODUCTOS
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]); // <-- NUEVO ESTADO PARA PRODUCTOS SELECCIONADOS
  const [calculatedMontoTotal, setCalculatedMontoTotal] = useState(0); // <-- NUEVO ESTADO PARA MONTO TOTAL CALCULADO

  const canCreateInvoices = hasFeatureAccess('billing_create');
  const canProcessPayments = hasFeatureAccess('billing_payment');

  const paymentSchema = z.object({
    amount: z.string().min(1, 'El monto es requerido'),
    method: z.enum(['cash', 'credit_card', 'debit_card', 'transfer'], {
      required_error: 'Por favor seleccione un método de pago',
    }),
    reference: z.string().optional(),
  });

  const paymentForm = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: '',
      method: 'cash',
      reference: '',
    },
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/ListarVenta`);
        setInvoices(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las facturas',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/ListarPagos`);
        setPayments(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los pagos',
          variant: 'destructive',
        });
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/MostrarClientes`);
        setClients(response.data.map((client) => ({
          id: client.clienteId.toString(),
          name: `${client.nombre} ${client.apellido}`
        })));
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los clientes',
          variant: 'destructive',
        });
      }
    };
    fetchClients();
  }, []);

  useEffect(() => { // <-- NUEVO USEEFFECT PARA OBTENER PRODUCTOS
    const fetchProducts = async () => {
      try {
        // Asumiendo que el endpoint es /ListarProductos y los productos tienen productoId, nombre y precio
        const response = await axios.get(`${API_BASE_URL}/ListarProductos`); 
        setProductsList(response.data.map((product: any) => ({
          id: product.productoId?.toString(), 
          name: product.nombre,
          price: product.precioUnitario || product.precioVenta || product.precio || 0
        })));
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los productos. Asegúrese de que el endpoint /ListarProductos sea correcto.',
          variant: 'destructive',
        });
      }
    };
    fetchProducts();
  }, []);

  const getClientNameById = (clientId: string | number): string => {
    if (!clientId && clientId !== 0) return '-'; // Allow clientId 0 if valid
    const client = clients.find(c => c.id === clientId.toString());
    return client ? client.name : 'Desconocido';
  };

  const handlePaymentSubmit = async (data) => {
    if (!selectedInvoice || typeof selectedInvoice.ventaId === 'undefined') {
        toast({
          title: 'Error',
          description: 'Factura no seleccionada o ID de factura inválido.',
          variant: 'destructive',
        });
        return;
    }
    try {
      const newPayment = {
        invoiceId: selectedInvoice.ventaId, // Use ventaId from API object
        amount: parseFloat(data.amount),
        method: data.method,
        reference: data.reference,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
      };
      await axios.post(`${API_BASE_URL}/RegistrarPago`, newPayment);
      toast({
        title: 'Pago registrado',
        description: `Se ha registrado un pago de $${data.amount} para la factura ${selectedInvoice.ventaId}.`, // Use ventaId
        variant: 'success',
      });
      setIsAddPaymentDialogOpen(false);
      setSelectedInvoice(null);
      paymentForm.reset();
      // Refrescar pagos e invoices
      const invoicesResp = await axios.get(`${API_BASE_URL}/ListarVenta`);
      setInvoices(invoicesResp.data);
      const paymentsResp = await axios.get(`${API_BASE_URL}/ListarPagos`);
      setPayments(paymentsResp.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo registrar el pago',
        variant: 'destructive',
      });
    }
  };

  const handleProductSelection = (productId: string, checked: boolean) => { // <-- NUEVA FUNCIÓN PARA MANEJAR SELECCIÓN DE PRODUCTOS
    setSelectedProducts(prev =>
      checked ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  const handleStatusChange = async (invoiceId: string | number, newStatus: string) => {
    if (typeof invoiceId === 'undefined') {
      toast({
        title: 'Error',
        description: 'ID de factura inválido para cambiar estado.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const invoiceToUpdate = invoices.find(inv => inv.ventaId === invoiceId);
      if (!invoiceToUpdate) {
        toast({
          title: 'Error',
          description: 'No se encontró la factura para actualizar.',
          variant: 'destructive',
        });
        return;
      }
      const updatedInvoice = { ...invoiceToUpdate, estado: newStatus };
      // Se utiliza el endpoint /PostVenta y se envía el objeto completo de la factura con el estado modificado
      await axios.put(`${API_BASE_URL}/PostVenta`, updatedInvoice);
      toast({
        title: 'Estado actualizado',
        description: `El estado de la factura ${invoiceId} ha sido actualizado a ${newStatus}.`,
        variant: 'success',
      });
      // Refrescar facturas
      const invoicesResp = await axios.get(`${API_BASE_URL}/ListarVenta`);
      setInvoices(invoicesResp.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: `No se pudo actualizar el estado de la factura ${invoiceId}. Verifique que el endpoint /PostVenta sea correcto y que el backend maneje la actualización de estado.`, 
        variant: 'destructive',
      });
      // Opcional: revertir el cambio en la UI si la API falla, aunque el Select ya lo maneja visualmente.
    }
  };

  useEffect(() => {
    const total = selectedProducts.reduce((sum, productId) => {
      const product = productsList.find(p => p.id === productId);
      return sum + (product?.price || 0);
    }, 0);
    setCalculatedMontoTotal(total);
  }, [selectedProducts, productsList]);

  // ... El resto del componente permanece igual, pero asegúrate de que todas las referencias a datos mock y funciones relacionadas sean eliminadas o adaptadas para trabajar con los datos reales obtenidos del backend ...

  // Aquí deberías adaptar las funciones getPetName, getClientName, etc., para que utilicen los datos reales en vez de los mocks.

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Facturación</h1>
        {canCreateInvoices && (
          <Button onClick={() => setIsCreateInvoiceDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nueva factura
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Facturas</CardTitle>
          <CardDescription>Listado de facturas registradas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">Cargando facturas...</TableCell>
                </TableRow>
              ) : invoices && invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">No hay facturas registradas.</TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice: any) => (
                  <TableRow key={invoice.ventaId}> {/* Use ventaId as key from API object */}
                    <TableCell>{invoice.ventaId || '-'}</TableCell> {/* Display ventaId from API object */}
                    <TableCell>{getClientNameById(invoice.clienteId)}</TableCell> {/* Client name from clienteId */}
                    <TableCell>{invoice.fechaVenta ? new Date(invoice.fechaVenta).toLocaleDateString() : '-'}</TableCell> {/* Date from fechaVenta */}
                    <TableCell>{typeof invoice.montoTotal === 'number' ? `$${invoice.montoTotal.toFixed(2)}` : '-'}</TableCell> {/* Amount from montoTotal */}
                    <TableCell>{invoice.metodoDePago || invoice.MetodoDePago || invoice.metodoPago || invoice.MetodoPago || (invoice.pago && invoice.pago.length > 0 && (invoice.pago[0].metodo || invoice.pago[0].Metodo)) || '-'}</TableCell> {/* Payment method from various possible fields */}
                    <TableCell>
                      <ExtendedBadge variant={invoice.estado === 'Pagada' ? 'success' : invoice.estado === 'Pendiente' ? 'warning' : invoice.estado === 'Cancelada' ? 'destructive' : 'default'}>
                        {invoice.estado || '-'}
                      </ExtendedBadge>
                    </TableCell>
                    <TableCell className="flex gap-2 items-center">
                      <Select
                        value={invoice.estado || 'Pendiente'} // Asegurar un valor por defecto si el estado es nulo
                        onValueChange={(newStatus) => handleStatusChange(invoice.ventaId, newStatus)}
                        disabled={!canProcessPayments} // O alguna otra lógica de permisos si es necesario
                      >
                        <SelectTrigger className="h-9 w-[130px]">
                          <SelectValue placeholder="Cambiar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="Pagada">Pagada</SelectItem>
                          <SelectItem value="Cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="destructive" onClick={async () => {
                        if(window.confirm('¿Está seguro que desea eliminar esta factura?')){
                          try {
                            if (typeof invoice.ventaId === 'undefined') {
                                toast({ title: 'Error', description: 'ID de factura inválido para eliminar.', variant: 'destructive' });
                                return;
                            }
                            await axios.delete(`${API_BASE_URL}/EliminarVenta/${invoice.ventaId}`); // Use ventaId from API object
                            toast({
                              title: 'Factura eliminada',
                              description: `La factura ${invoice.ventaId} ha sido eliminada exitosamente.`, // Use ventaId
                              variant: 'success',
                            });
                            // Refrescar facturas
                            const invoicesResp = await axios.get(`${API_BASE_URL}/ListarVenta`);
                            setInvoices(invoicesResp.data);
                          } catch (error) {
                            toast({
                              title: 'Error',
                              description: 'No se pudo eliminar la factura',
                              variant: 'destructive',
                            });
                          }
                        }
                      }}>
                        <XCircleIcon className="h-4 w-4 mr-1" /> Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isCreateInvoiceDialogOpen} onOpenChange={(isOpen) => {
        setIsCreateInvoiceDialogOpen(isOpen);
        if (!isOpen) {
          setSelectedProducts([]); // Limpiar productos seleccionados al cerrar
        }
      }}>
        <DialogTrigger asChild>
          {/* El botón ya está arriba, así que no se muestra aquí */}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva factura</DialogTitle>
            <DialogDescription>Complete los datos para registrar una nueva factura.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                if (selectedProducts.length === 0) {
                  toast({
                    title: 'Advertencia',
                    description: 'Debe seleccionar al menos un producto o servicio.',
                    variant: 'default',
                  });
                  return;
                }

                const detalleVenta = selectedProducts.map(productId => {
                  const product = productsList.find(p => p.id === productId);
                  return {
                    productoId: parseInt(product.id, 10),
                    nombreProducto: product.name,
                    cantidad: 1, // Asumir cantidad 1 por ahora, se puede expandir para permitir entrada de cantidad
                    precioUnitario: product.price, // Usar el precio del producto
                    // El subtotal debería calcularse en el backend o aquí si es necesario
                  };
                });

                // Calcular montoTotal basado en detalleVenta si es necesario, o mantener el input manual
                const nuevaFactura = {
                  clienteId: parseInt(formData.get('clienteId') as string, 10),
                  fechaVenta: formData.get('fechaVenta') as string,
                  montoTotal: calculatedMontoTotal, // Usar el montoTotal calculado
                  estado: 'Pendiente',
                  metodoPago: formData.get('metodoPago') as string, // Corregido de metodoDePago a metodoPago
                  detalleVenta: detalleVenta
                };

                await axios.post(`${API_BASE_URL}/GuardarVenta`, nuevaFactura);
                toast({
                  title: 'Factura registrada',
                  description: 'La factura ha sido registrada exitosamente.',
                  variant: 'success',
                });
                setIsCreateInvoiceDialogOpen(false);
                setSelectedProducts([]); // Limpiar productos seleccionados
                // Refrescar facturas
                const invoicesResp = await axios.get(`${API_BASE_URL}/ListarVenta`);
                setInvoices(invoicesResp.data);
              } catch (error) {
                toast({
                  title: 'Error',
                  description: 'No se pudo registrar la factura',
                  variant: 'destructive',
                });
              }
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="clienteId">Cliente</Label>
              <Select name="clienteId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fechaVenta">Fecha</Label>
              <Input name="fechaVenta" type="date" required />
            </div>
            <div>
              <Label htmlFor="productos">Productos/Servicios</Label>
              <div className="max-h-48 overflow-y-auto space-y-2 border p-3 rounded-md bg-background">
                {productsList.length > 0 ? (
                  productsList.map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md">
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) => handleProductSelection(product.id, !!checked)}
                        aria-label={`Seleccionar ${product.name}`}
                      />
                      <Label htmlFor={`product-${product.id}`} className="font-normal flex-grow cursor-pointer">
                        {product.name} 
                        <span className="text-sm text-muted-foreground ml-2">
                          (${typeof product.price === 'number' ? product.price.toFixed(2) : 'Precio no disp.'})
                        </span>
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-2">Cargando productos o no hay productos disponibles...</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="montoTotal">Monto Total</Label>
              <Input name="montoTotal" type="number" step="0.01" value={calculatedMontoTotal.toFixed(2)} readOnly required />
            </div>
            {/* El input original se comenta o elimina, ya que ahora es calculado y readOnly 
            <Input name="montoTotal" type="number" step="0.01" required />
            */}
            <div>
              <Label htmlFor="metodoPago">Método de Pago</Label>
              <Select name="metodoPago" required defaultValue="efectivo">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="tarjeta_credito">Tarjeta de Crédito</SelectItem>
                  <SelectItem value="tarjeta_debito">Tarjeta de Débito</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Registrar factura</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* El diálogo de edición fue eliminado ya que el botón de editar se reemplazó por el cambio de estado */}
    </div>
  );
};

export default Billing;
