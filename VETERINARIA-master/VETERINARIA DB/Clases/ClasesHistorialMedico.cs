using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;
namespace VETERINARIA_DB.Clases
{
    public class ClasesHistorialMedico
    {

        private readonly VeterinariaDbContext _context;

        public ClasesHistorialMedico(VeterinariaDbContext context)
        {
            _context = context;
        }
        // Métodos HistorialMedico
        public string PostHistorialMedico(HistorialMedico dato)
        {
            try
            {
                _context.HistorialMedicos.Add(dato);
                _context.SaveChanges();
                return "Historial médico creado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al crear historial médico: {ex.Message}";
            }
        }

        public HistorialMedico GetHistorialMedico(int id)
        {
            try
            {
                return _context.HistorialMedicos.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<HistorialMedico> GetHistorialMedicos()
        {
            try
            {
                return _context.HistorialMedicos.ToList();
            }
            catch (Exception)
            {
                return new List<HistorialMedico>();
            }
        }

        public string DeleteHistorialMedico(int id)
        {
            try
            {
                var historial = _context.HistorialMedicos.Find(id);
                if (historial == null)
                    return "El historial médico no existe";

                _context.HistorialMedicos.Remove(historial);
                _context.SaveChanges();
                return "Historial médico eliminado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al eliminar historial médico: {ex.Message}";
            }
        }

        public string PutHistorialMedico(HistorialMedico dato)
        {
            try
            {
                _context.HistorialMedicos.Update(dato);
                _context.SaveChanges();
                return "Historial médico actualizado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al actualizar historial médico: {ex.Message}";
            }
        }

    }
}
