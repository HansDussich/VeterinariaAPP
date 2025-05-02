using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;
namespace VETERINARIA_DB.Clases
{
    public class ClasesProveedore
    {
        private readonly VeterinariaDbContext _context;

        public ClasesProveedore(VeterinariaDbContext context)
        {
            _context = context;
        }
        // Métodos Proveedor
        public string PostProveedor(Proveedore dato)
        {
            try
            {
                _context.Proveedores.Add(dato);
                _context.SaveChanges();
                return "Proveedor registrado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al registrar proveedor: {ex.Message}";
            }
        }

        public Proveedore GetProveedor(int id)
        {
            try
            {
                return _context.Proveedores.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<Proveedore> GetProveedores()
        {
            try
            {
                return _context.Proveedores.ToList();
            }
            catch (Exception)
            {
                return new List<Proveedore>();
            }
        }

        public string DeleteProveedor(int id)
        {
            try
            {
                var proveedor = _context.Proveedores.Find(id);
                if (proveedor == null)
                    return "El proveedor no existe";

                _context.Proveedores.Remove(proveedor);
                _context.SaveChanges();
                return "Proveedor eliminado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al eliminar proveedor: {ex.Message}";
            }
        }

        public string PutProveedor(Proveedore dato)
        {
            try
            {
                _context.Proveedores.Update(dato);
                _context.SaveChanges();
                return "Proveedor actualizado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al actualizar proveedor: {ex.Message}";
            }
        }


    }
}
