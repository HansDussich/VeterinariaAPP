using System;
using System.Collections.Generic;

namespace VETERINARIA_DB.Models;

public partial class Recordatorio
{
    public int RecordatorioId { get; set; }

    public int? MascotaId { get; set; }

    public string? Tipo { get; set; }

    public string? Descripcion { get; set; }

    public DateTime? FechaNotificacion { get; set; }

    public string? Estado { get; set; }

    public virtual Mascota? Mascota { get; set; }
}
