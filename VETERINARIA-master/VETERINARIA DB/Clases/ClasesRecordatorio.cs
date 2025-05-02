using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;

namespace VETERINARIA_DB.Clases
{
    public class ClasesRecordatorio
    {

        private readonly VeterinariaDbContext _context;

        public ClasesRecordatorio(VeterinariaDbContext context)
        {
            _context = context;
        }

        // Métodos Recordatorio
        public string PostRecordatorio(Recordatorio dato)
        {
            try
            {
                _context.Recordatorios.Add(dato);
                _context.SaveChanges();
                return "Recordatorio registrado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al registrar recordatorio: {ex.Message}";
            }
        }

        public Recordatorio GetRecordatorio(int id)
        {
            try
            {
                return _context.Recordatorios.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<Recordatorio> GetRecordatorios()
        {
            try
            {
                return _context.Recordatorios.ToList();
            }
            catch (Exception)
            {
                return new List<Recordatorio>();
            }
        }

        public string DeleteRecordatorio(int id)
        {
            try
            {
                var recordatorio = _context.Recordatorios.Find(id);
                if (recordatorio == null)
                    return "El recordatorio no existe";

                _context.Recordatorios.Remove(recordatorio);
                _context.SaveChanges();
                return "Recordatorio eliminado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al eliminar recordatorio: {ex.Message}";
            }
        }

        public string PutRecordatorio(Recordatorio dato)
        {
            try
            {
                _context.Recordatorios.Update(dato);
                _context.SaveChanges();
                return "Recordatorio actualizado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al actualizar recordatorio: {ex.Message}";
            }
        }


    }
}
