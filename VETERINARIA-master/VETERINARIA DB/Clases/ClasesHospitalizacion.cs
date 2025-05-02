using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;
namespace VETERINARIA_DB.Clases
{
    public class ClasesHospitalizacion
    {
        private readonly VeterinariaDbContext _context;

        public ClasesHospitalizacion(VeterinariaDbContext context)
        {
            _context = context;
        }

        // Métodos Hospitalizacion
        public string PostHospitalizacion(Hospitalizacion dato)
        {
            try
            {
                _context.Hospitalizacions.Add(dato);
                _context.SaveChanges();
                return "Hospitalización registrada exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al registrar hospitalización: {ex.Message}";
            }
        }

        public Hospitalizacion GetHospitalizacion(int id)
        {
            try
            {
                return _context.Hospitalizacions.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<Hospitalizacion> GetHospitalizaciones()
        {
            try
            {
                return _context.Hospitalizacions.ToList();
            }
            catch (Exception)
            {
                return new List<Hospitalizacion>();
            }
        }

        public string DeleteHospitalizacion(int id)
        {
            try
            {
                var hospitalizacion = _context.Hospitalizacions.Find(id);
                if (hospitalizacion == null)
                    return "La hospitalización no existe";

                _context.Hospitalizacions.Remove(hospitalizacion);
                _context.SaveChanges();
                return "Hospitalización eliminada exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al eliminar hospitalización: {ex.Message}";
            }
        }

        public string PutHospitalizacion(Hospitalizacion dato)
        {
            try
            {
                _context.Hospitalizacions.Update(dato);
                _context.SaveChanges();
                return "Hospitalización actualizada exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al actualizar hospitalización: {ex.Message}";
            }
        }


    }
}
