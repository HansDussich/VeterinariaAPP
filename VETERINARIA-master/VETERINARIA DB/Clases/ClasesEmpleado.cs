using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;
namespace VETERINARIA_DB.Clases
{
    public class ClasesEmpleado
    {

        private readonly VeterinariaDbContext _context;

        public ClasesEmpleado(VeterinariaDbContext context)
        {
            _context = context;
        }
        // Métodos Empleado
        public string PostEmpleado(Empleado dato)
        {
            try
            {
                _context.Empleados.Add(dato);
                _context.SaveChanges();
                return "Empleado creado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al crear empleado: {ex.Message}";
            }
        }

        public Empleado GetEmpleado(int id)
        {
            try
            {
                return _context.Empleados.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<Empleado> GetEmpleados()
        {
            try
            {
                return _context.Empleados.ToList();
            }
            catch (Exception)
            {
                return new List<Empleado>();
            }
        }

        public List<Empleado> GetVeterinarios()
        {
            try
            {
                return _context.Empleados.Where(e => e.Cargo == "Veterinario").ToList();
            }
            catch (Exception)
            {
                return new List<Empleado>();
            }
        }

        public string DeleteEmpleado(int id)
        {
            try
            {
                var empleado = _context.Empleados.Find(id);
                if (empleado == null)
                    return "El empleado no existe";

                _context.Empleados.Remove(empleado);
                _context.SaveChanges();
                return "Empleado eliminado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al eliminar empleado: {ex.Message}";
            }
        }

        public string PutEmpleado(Empleado dato)
        {
            try
            {
                _context.Empleados.Update(dato);
                _context.SaveChanges();
                return "Empleado actualizado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al actualizar empleado: {ex.Message}";
            }
        }


    }
}
