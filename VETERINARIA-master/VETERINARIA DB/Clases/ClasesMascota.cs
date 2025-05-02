using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;
namespace VETERINARIA_DB.Clases
{
    public class ClasesMascota
    {
        private readonly VeterinariaDbContext _context;

        public ClasesMascota(VeterinariaDbContext context)
        {
            _context = context;
        }

        // Métodos Mascota
        public string PostMascota(Mascota dato)
        {
            try
            {
                _context.Mascotas.Add(dato);
                _context.SaveChanges();
                return "Mascota creada exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al crear mascota: {ex.Message}";
            }
        }

        public Mascota GetMascota(int id)
        {
            try
            {
                return _context.Mascotas.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<Mascota> GetMascotas()
        {
            try
            {
                return _context.Mascotas.ToList();
            }
            catch (Exception)
            {
                return new List<Mascota>();
            }
        }

        public string DeleteMascota(int id)
        {
            try
            {
                var mascota = _context.Mascotas.Find(id);
                if (mascota == null)
                    return "La mascota no existe";

                _context.Mascotas.Remove(mascota);
                _context.SaveChanges();
                return "Mascota eliminada exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al eliminar mascota: {ex.Message}";
            }
        }

        public string PutMascota(Mascota dato)
        {
            try
            {
                _context.Mascotas.Update(dato);
                _context.SaveChanges();
                return "Mascota actualizada exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al actualizar mascota: {ex.Message}";
            }
        }

    }
}
