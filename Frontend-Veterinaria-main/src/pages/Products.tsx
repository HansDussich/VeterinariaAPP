import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE_URL = 'https://localhost:7290';

interface Product {
  productoId: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  stock: number;
  fechaRegistro: string;
  proveedorId: number;
  proveedor?: {
    nombre: string;
    contacto: string;
  };
}

interface Supplier {
  proveedorId: number;
  nombre: string;
  contacto: string;
}

const Products = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeFilters, setActiveFilters] = useState({
    inStock: true,
    lowStock: true,
    outOfStock: true,
    alimentos: true,
    medicamentos: true,
    higiene: true,
    accesorios: true
  });

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    descripcion: '',
    precio: '',
    stock: '',
    proveedorId: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/ListarProductos`);
      const productsWithDetails = await Promise.all(
        response.data.map(async (product: Product) => {
          try {
            if (product.proveedorId) {
              const supplierResponse = await axios.get(`${API_BASE_URL}/ObtenerProveedorPorId/${product.proveedorId}`);
              return {
                ...product,
                proveedor: supplierResponse.data
              };
            }
            return product;
          } catch (error) {
            console.error('Error fetching supplier details:', error);
            return product;
          }
        })
      );
      setProducts(productsWithDetails);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ListarProveedores`);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los proveedores',
        variant: 'destructive',
      });
    }
  };

  const fetchProduct = async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ObtenerProductoPorId/${id}`);
      const product = response.data;
      setFormData({
        nombre: product.nombre,
        categoria: product.categoria,
        descripcion: product.descripcion,
        precio: product.precio.toString(),
        stock: product.stock.toString(),
        proveedorId: product.proveedorId.toString()
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el producto',
        variant: 'destructive',
      });
      navigate('/products');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        proveedorId: parseInt(formData.proveedorId)
      };

      if (isEditing && selectedProduct) {
        await axios.put(`${API_BASE_URL}/ActualizarProducto`, {
          ...productData,
          productoId: selectedProduct.productoId
        });
        toast({
          title: 'Éxito',
          description: 'Producto actualizado correctamente',
        });
      } else {
        await axios.post(`${API_BASE_URL}/GuardarProducto`, productData);
        toast({
          title: 'Éxito',
          description: 'Producto creado correctamente',
        });
      }

      setIsDialogOpen(false);
      setFormData({
        nombre: '',
        categoria: '',
        descripcion: '',
        precio: '',
        stock: '',
        proveedorId: ''
      });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: `No se pudo ${isEditing ? 'actualizar' : 'crear'} el producto`,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (productId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/EliminarProducto/${productId}`);
      toast({
        title: 'Éxito',
        description: 'Producto eliminado correctamente',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto',
        variant: 'destructive',
      });
    }
  };

  const getStockVariant = (stock: number): "success" | "warning" | "destructive" => {
    if (stock > 10) return "success";
    if (stock > 0) return "warning";
    return "destructive";
  };

  const getStockStatus = (stock: number): string => {
    if (stock > 10) return "En Stock";
    if (stock > 0) return "Stock Bajo";
    return "Sin Stock";
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStockFilter = 
      (activeFilters.inStock && product.stock > 10) ||
      (activeFilters.lowStock && product.stock > 0 && product.stock <= 10) ||
      (activeFilters.outOfStock && product.stock === 0);

    const matchesCategoryFilter = 
      (activeFilters.alimentos && product.categoria.toLowerCase().includes('alimento')) ||
      (activeFilters.medicamentos && product.categoria.toLowerCase().includes('medicamento')) ||
      (activeFilters.higiene && product.categoria.toLowerCase().includes('higiene')) ||
      (activeFilters.accesorios && product.categoria.toLowerCase().includes('accesorio'));

    return matchesSearch && matchesStockFilter && matchesCategoryFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => {
          setIsEditing(false);
          setFormData({
            nombre: '',
            categoria: '',
            descripcion: '',
            precio: '',
            stock: '',
            proveedorId: ''
          });
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, categoría o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Estado de Stock</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={activeFilters.inStock}
                      onCheckedChange={(checked) => setActiveFilters(prev => ({ ...prev, inStock: checked as boolean }))}
                    />
                    <Label htmlFor="inStock">En Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowStock"
                      checked={activeFilters.lowStock}
                      onCheckedChange={(checked) => setActiveFilters(prev => ({ ...prev, lowStock: checked as boolean }))}
                    />
                    <Label htmlFor="lowStock">Stock Bajo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="outOfStock"
                      checked={activeFilters.outOfStock}
                      onCheckedChange={(checked) => setActiveFilters(prev => ({ ...prev, outOfStock: checked as boolean }))}
                    />
                    <Label htmlFor="outOfStock">Sin Stock</Label>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Categorías</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="alimentos"
                      checked={activeFilters.alimentos}
                      onCheckedChange={(checked) => setActiveFilters(prev => ({ ...prev, alimentos: checked as boolean }))}
                    />
                    <Label htmlFor="alimentos">Alimentos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medicamentos"
                      checked={activeFilters.medicamentos}
                      onCheckedChange={(checked) => setActiveFilters(prev => ({ ...prev, medicamentos: checked as boolean }))}
                    />
                    <Label htmlFor="medicamentos">Medicamentos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="higiene"
                      checked={activeFilters.higiene}
                      onCheckedChange={(checked) => setActiveFilters(prev => ({ ...prev, higiene: checked as boolean }))}
                    />
                    <Label htmlFor="higiene">Higiene</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accesorios"
                      checked={activeFilters.accesorios}
                      onCheckedChange={(checked) => setActiveFilters(prev => ({ ...prev, accesorios: checked as boolean }))}
                    />
                    <Label htmlFor="accesorios">Accesorios</Label>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No se encontraron productos</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.productoId}>
                      <TableCell>{product.productoId}</TableCell>
                      <TableCell>{product.nombre}</TableCell>
                      <TableCell>{product.categoria}</TableCell>
                      <TableCell>${product.precio.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={getStockVariant(product.stock)}>
                          {getStockStatus(product.stock)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setIsEditing(true);
                              setSelectedProduct(product);
                              setFormData({
                                nombre: product.nombre,
                                categoria: product.categoria,
                                descripcion: product.descripcion,
                                precio: product.precio.toString(),
                                stock: product.stock.toString(),
                                proveedorId: product.proveedorId.toString()
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del producto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alimentos">Alimentos</SelectItem>
                    <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                    <SelectItem value="Higiene">Higiene</SelectItem>
                    <SelectItem value="Accesorios">Accesorios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="Ingrese el precio"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="Ingrese el stock"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proveedorId">Proveedor</Label>
                <Select
                  value={formData.proveedorId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, proveedorId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.proveedorId} value={supplier.proveedorId.toString()}>
                        {supplier.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Ingrese la descripción del producto"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  if (isEditing) {
                    navigate('/products');
                  }
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el producto "{selectedProduct?.nombre}"?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedProduct) {
                  handleDelete(selectedProduct.productoId);
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
