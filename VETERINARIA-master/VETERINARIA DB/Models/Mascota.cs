using System;
using System.Collections.Generic;

namespace VETERINARIA_DB.Models;

public partial class Mascota
{
    public int MascotaId { get; set; }

    public int? ClienteId { get; set; }

    public string? Nombre { get; set; }

    public string? Tipo { get; set; }

    public string? Raza { get; set; }

    public DateTime? FechaNacimiento { get; set; }

    public string? Genero { get; set; }

    public string? Estado { get; set; }

    public DateTime? FechaRegistro { get; set; }

    public virtual ICollection<Cita> Cita { get; set; } = new List<Cita>();

    public virtual Cliente? Cliente { get; set; }

    public virtual ICollection<HistorialMedico> HistorialMedicos { get; set; } = new List<HistorialMedico>();

    public virtual ICollection<Hospitalizacion> Hospitalizacions { get; set; } = new List<Hospitalizacion>();

    public virtual ICollection<Recordatorio> Recordatorios { get; set; } = new List<Recordatorio>();
}
