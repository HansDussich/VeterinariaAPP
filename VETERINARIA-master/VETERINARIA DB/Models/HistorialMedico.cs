using System;
using System.Collections.Generic;

namespace VETERINARIA_DB.Models;

public partial class HistorialMedico
{
    public int HistorialId { get; set; }

    public int? MascotaId { get; set; }

    public int? VeterinarioId { get; set; }

    public DateTime? FechaConsulta { get; set; }

    public string? Diagnostico { get; set; }

    public string? Tratamiento { get; set; }

    public string? Notas { get; set; }

    public virtual Mascota? Mascota { get; set; }

    public virtual Empleado? Veterinario { get; set; }
}
