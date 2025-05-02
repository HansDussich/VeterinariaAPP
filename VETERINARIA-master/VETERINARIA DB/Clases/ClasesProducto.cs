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
            try
            {
                var producto = _context.Productos.Find(id);
                if (producto == null)
                    return "El producto no existe";

                _context.Productos.Remove(producto);
                _context.SaveChanges();
                return "Producto eliminado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al eliminar producto: {ex.Message}";
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
