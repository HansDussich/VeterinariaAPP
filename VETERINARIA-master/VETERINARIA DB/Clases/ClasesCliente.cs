using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;
using Microsoft.EntityFrameworkCore;

namespace VETERINARIA_DB.Clases
{
    public class ClasesCliente
    {
        private readonly VeterinariaDbContext _context;

        public ClasesCliente(VeterinariaDbContext context)
        {
            _context = context;
        }

        public string Guardar(Cliente dato)
        {
            try
            {
                _context.Clientes.Add(dato);
                _context.SaveChanges();
                return "ok";
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }

        public string EliminarCliente(int id)
        {
            using var transaction = _context.Database.BeginTransaction();
            try
            {
                // Primero eliminar todas las citas del cliente
                var citas = _context.Citas.Where(c => c.ClienteId == id).ToList();
                if (citas.Any())
                {
                    _context.Citas.RemoveRange(citas);
                    _context.SaveChanges();
                }

                // Eliminar todas las mascotas y sus registros relacionados
                var mascotas = _context.Mascotas.Where(m => m.ClienteId == id).ToList();
                foreach (var mascota in mascotas)
                {
                    // Eliminar historiales médicos
                    var historiales = _context.HistorialMedicos.Where(h => h.MascotaId == mascota.MascotaId).ToList();
                    if (historiales.Any())
                    {
                        _context.HistorialMedicos.RemoveRange(historiales);
                        _context.SaveChanges();
                    }

                    // Eliminar hospitalizaciones
                    var hospitalizaciones = _context.Hospitalizacions.Where(h => h.MascotaId == mascota.MascotaId).ToList();
                    if (hospitalizaciones.Any())
                    {
                        _context.Hospitalizacions.RemoveRange(hospitalizaciones);
                        _context.SaveChanges();
                    }

                    // Eliminar recordatorios
                    var recordatorios = _context.Recordatorios.Where(r => r.MascotaId == mascota.MascotaId).ToList();
                    if (recordatorios.Any())
                    {
                        _context.Recordatorios.RemoveRange(recordatorios);
                        _context.SaveChanges();
                    }
                }
                if (mascotas.Any())
                {
                    _context.Mascotas.RemoveRange(mascotas);
                    _context.SaveChanges();
                }

                // Obtener todas las ventas del cliente
                var ventas = _context.Ventas.Where(v => v.ClienteId == id).ToList();
                if (ventas.Any())
                {
                    // Primero eliminar los pagos asociados a cada venta
                    foreach (var venta in ventas)
                    {
                        var pagos = _context.Pagos.Where(p => p.VentaId == venta.VentaId).ToList();
                        if (pagos.Any())
                        {
                            _context.Pagos.RemoveRange(pagos);
                            _context.SaveChanges();
                        }
                    }
                    
                    // Ahora sí eliminar las ventas
                    _context.Ventas.RemoveRange(ventas);
                    _context.SaveChanges();
                }

                // Finalmente eliminar el cliente
                var cliente = _context.Clientes.Find(id);
                if (cliente == null)
                {
                    transaction.Rollback();
                    return "El cliente no existe";
                }

                _context.Clientes.Remove(cliente);
                _context.SaveChanges();
                transaction.Commit();
                return "ok";
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return $"Error al eliminar cliente: {ex.Message}. Inner Exception: {ex.InnerException?.Message}";
            }
        }

        public Cliente MostrarClientePorId(int id)
        {
            try
            {
                return _context.Clientes.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<Cliente> MostrarClientes()
        {
            try
            {
                return _context.Clientes.ToList();
            }
            catch (Exception)
            {
                return new List<Cliente>();
            }
        }

        public string ActualizarCliente(Cliente dato)
        {
            try
            {
                _context.Clientes.Update(dato);
                _context.SaveChanges();
                return "ok";
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }
    }
}

