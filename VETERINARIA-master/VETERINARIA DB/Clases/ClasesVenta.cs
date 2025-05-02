using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;
namespace VETERINARIA_DB.Clases
{
    public class ClasesVenta
    {
        private readonly VeterinariaDbContext _context;

        public ClasesVenta(VeterinariaDbContext context)
        {
            _context = context;
        }

        // Métodos Venta
        public string PostVenta(Venta dato)
        {
            try
            {
                _context.Ventas.Add(dato);
                _context.SaveChanges();
                return "Venta registrada exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al registrar venta: {ex.Message}";
            }
        }

        public Venta GetVenta(int id)
        {
            try
            {
                return _context.Ventas.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<Venta> GetVentas()
        {
            try
            {
                return _context.Ventas.ToList();
            }
            catch (Exception)
            {
                return new List<Venta>();
            }
        }

        public string DeleteVenta(int id)
        {
            try
            {
                var venta = _context.Ventas.Find(id);
                if (venta == null)
                    return "La venta no existe";

                _context.Ventas.Remove(venta);
                _context.SaveChanges();
                return "Venta eliminada exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al eliminar venta: {ex.Message}";
            }
        }

        public string PutVenta(Venta dato)
        {
            try
            {
                _context.Ventas.Update(dato);
                _context.SaveChanges();
                return "Venta actualizada exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al actualizar venta: {ex.Message}";
            }
        }


    }
}
