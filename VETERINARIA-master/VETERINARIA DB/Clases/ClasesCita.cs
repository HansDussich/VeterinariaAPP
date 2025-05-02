using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;
namespace VETERINARIA_DB.Clases
{
    public class ClasesCita
    {

        private readonly VeterinariaDbContext _context;

        public ClasesCita(VeterinariaDbContext context)
        {
            _context = context;
        }
        // Métodos Cita
        public string PostCita(Cita dato)
        {
            try
            {
                _context.Citas.Add(dato);
                _context.SaveChanges();
                return "Cita creada exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al crear cita: {ex.Message}";
            }
        }

        public Cita GetCita(int id)
        {
            try
            {
                return _context.Citas.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<Cita> GetCitas()
        {
            try
            {
                return _context.Citas.ToList();
            }
            catch (Exception)
            {
                return new List<Cita>();
            }
        }

        public string DeleteCita(int id)
        {
            try
            {
                var cita = _context.Citas.Find(id);
                if (cita == null)
                    return "La cita no existe";

                _context.Citas.Remove(cita);
                _context.SaveChanges();
                return "Cita eliminada exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al eliminar cita: {ex.Message}";
            }
        }

        public string PutCita(Cita dato)
        {
            try
            {
                _context.Citas.Update(dato);
                _context.SaveChanges();
                return "Cita actualizada exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al actualizar cita: {ex.Message}";
            }
        }

    }
}
