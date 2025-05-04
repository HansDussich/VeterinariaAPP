using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;
namespace VETERINARIA_DB.Clases
{
    public class ClasesProducto
    {
        private readonly VeterinariaDbContext _context;

        public ClasesProducto(VeterinariaDbContext context)
        {
            _context = context;
        }
        // Métodos Producto
        public string PostProducto(Producto dato)
        {
            try
            {
                _context.Productos.Add(dato);
                _context.SaveChanges();
                return "Producto creado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al crear producto: {ex.Message}";
            }
        }

        public Producto GetProducto(int id)
        {
            try
            {
                return _context.Productos.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<Producto> GetProductos()
        {
            try
            {
                return _context.Productos.ToList();
            }
            catch (Exception)
            {
                return new List<Producto>();
            }
        }

        public string DeleteProducto(int id)
        {
            using var transaction = _context.Database.BeginTransaction();
            try
            {
                var producto = _context.Productos.Find(id);
                if (producto == null)
                    return "El producto no existe";

                // Eliminar todas las ventas asociadas al producto
                var ventas = _context.Ventas.Where(v => v.ProductoId == id).ToList();
                if (ventas.Any())
                {
                    // Primero eliminar los pagos asociados a cada venta
                    foreach (var venta in ventas)
                    {
                        var pagos = _context.Pagos.Where(p => p.VentaId == venta.VentaId).ToList();
                        if (pagos.Any())
                        {
                            _context.Pagos.RemoveRange(pagos);
                            _context.SaveChanges();
                        }
                    }
                    
                    // Ahora sí eliminar las ventas
                    _context.Ventas.RemoveRange(ventas);
                    _context.SaveChanges();
                }

                // Desvincular el producto de su proveedor
                producto.Proveedor = null;
                producto.ProveedorId = null;
                _context.SaveChanges();

                _context.Productos.Remove(producto);
                _context.SaveChanges();
                transaction.Commit();
                return "Producto eliminado exitosamente";
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                var errorMessage = $"Error al eliminar producto: {ex.Message}";
                if (ex.InnerException != null)
                {
                    errorMessage += $"\nInner Exception: {ex.InnerException.Message}";
                    if (ex.InnerException.InnerException != null)
                    {
                        errorMessage += $"\nInner Inner Exception: {ex.InnerException.InnerException.Message}";
                    }
                }
                return errorMessage;
            }
        }

        public string PutProducto(Producto dato)
        {
            try
            {
                _context.Productos.Update(dato);
                _context.SaveChanges();
                return "Producto actualizado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al actualizar producto: {ex.Message}";
            }
        }


    }
}
