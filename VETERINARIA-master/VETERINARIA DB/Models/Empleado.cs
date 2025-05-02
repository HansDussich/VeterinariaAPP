using System;
using System.Collections.Generic;

namespace VETERINARIA_DB.Models;

public partial class Empleado
{
    public int EmpleadoId { get; set; }

    public string? Nombre { get; set; }

    public string? Apellido { get; set; }

    public string? Cargo { get; set; }

    public string? Telefono { get; set; }

    public string? Correo { get; set; }

    public string? Turno { get; set; }

    public DateTime? FechaIngreso { get; set; }

    public DateTime? FechaNacimiento { get; set; }

    public string? Contraseña { get; set; }

    public string? Estado { get; set; }

    public virtual ICollection<Cita> Cita { get; set; } = new List<Cita>();

    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();

    public virtual ICollection<HistorialMedico> HistorialMedicos { get; set; } = new List<HistorialMedico>();

    public virtual ICollection<Hospitalizacion> Hospitalizacions { get; set; } = new List<Hospitalizacion>();
}
