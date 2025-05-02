using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;
namespace VETERINARIA_DB.Clases
{
    public class ClasesPago
    {
        private readonly VeterinariaDbContext _context;

        public ClasesPago(VeterinariaDbContext context)
        {
            _context = context;
        }

        // Métodos Pago
        public string PostPago(Pago dato)
        {
            try
            {
                _context.Pagos.Add(dato);
                _context.SaveChanges();
                return "Pago registrado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al registrar pago: {ex.Message}";
            }
        }

        public Pago GetPago(int id)
        {
            try
            {
                return _context.Pagos.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<Pago> GetPagos()
        {
            try
            {
                return _context.Pagos.ToList();
            }
            catch (Exception)
            {
                return new List<Pago>();
            }
        }

        public string DeletePago(int id)
        {
            try
            {
                var pago = _context.Pagos.Find(id);
                if (pago == null)
                    return "El pago no existe";

                _context.Pagos.Remove(pago);
                _context.SaveChanges();
                return "Pago eliminado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al eliminar pago: {ex.Message}";
            }
        }

        public string PutPago(Pago dato)
        {
            try
            {
                _context.Pagos.Update(dato);
                _context.SaveChanges();
                return "Pago actualizado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al actualizar pago: {ex.Message}";
            }
        }

    }
}
