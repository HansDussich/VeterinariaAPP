using System;
using System.Collections.Generic;

namespace VETERINARIA_DB.Models;

public partial class Cita
{
    public int CitaId { get; set; }

    public int? MascotaId { get; set; }

    public int? ClienteId { get; set; }

    public int? VeterinarioId { get; set; }

    public DateTime? FechaCita { get; set; }

    public string? Estado { get; set; }

    public string? Motivo { get; set; }

    public DateTime? FechaCreacion { get; set; }

    public bool? Confirmada { get; set; }

    public virtual Cliente? Cliente { get; set; }

    public virtual Mascota? Mascota { get; set; }

    public virtual Empleado? Veterinario { get; set; }
}
