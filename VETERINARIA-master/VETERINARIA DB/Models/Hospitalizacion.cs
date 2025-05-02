using System;
using System.Collections.Generic;

namespace VETERINARIA_DB.Models;

public partial class Hospitalizacion
{
    public int HospitalizacionId { get; set; }

    public int? MascotaId { get; set; }

    public DateTime? FechaIngreso { get; set; }

    public DateTime? FechaAlta { get; set; }

    public string? Estado { get; set; }

    public int? MedicoResponsable { get; set; }

    public string? NotasTratamiento { get; set; }

    public virtual Mascota? Mascota { get; set; }

    public virtual Empleado? MedicoResponsableNavigation { get; set; }
}
