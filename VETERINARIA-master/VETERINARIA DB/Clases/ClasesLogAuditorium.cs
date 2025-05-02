using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;
namespace VETERINARIA_DB.Clases
{
    public class ClasesLogAuditorium
    {
        private readonly VeterinariaDbContext _context;

        public ClasesLogAuditorium(VeterinariaDbContext context)
        {
            _context = context;
        }
        // Métodos LogAuditorium
        public string PostLogAuditorium(LogAuditorium dato)
        {
            try
            {
                _context.LogAuditoria.Add(dato);
                _context.SaveChanges();
                return "Log de auditoría registrado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al registrar log de auditoría: {ex.Message}";
            }
        }

        public LogAuditorium GetLogAuditorium(int id)
        {
            try
            {
                return _context.LogAuditoria.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<LogAuditorium> GetLogAuditoria()
        {
            try
            {
                return _context.LogAuditoria.ToList();
            }
            catch (Exception)
            {
                return new List<LogAuditorium>();
            }
        }

        public string DeleteLogAuditorium(int id)
        {
            try
            {
                var log = _context.LogAuditoria.Find(id);
                if (log == null)
                    return "El log de auditoría no existe";

                _context.LogAuditoria.Remove(log);
                _context.SaveChanges();
                return "Log de auditoría eliminado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al eliminar log de auditoría: {ex.Message}";
            }
        }

        public string PutLogAuditorium(LogAuditorium dato)
        {
            try
            {
                _context.LogAuditoria.Update(dato);
                _context.SaveChanges();
                return "Log de auditoría actualizado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al actualizar log de auditoría: {ex.Message}";
            }
        }


    }
}
