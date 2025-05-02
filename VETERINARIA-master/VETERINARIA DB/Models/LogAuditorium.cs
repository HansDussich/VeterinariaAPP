using System;
using System.Collections.Generic;

namespace VETERINARIA_DB.Models;

public partial class LogAuditorium
{
    public int LogId { get; set; }

    public int? UsuarioId { get; set; }

    public string? Accion { get; set; }

    public DateTime? Fecha { get; set; }

    public string? Detalles { get; set; }

    public virtual Usuario? Usuario { get; set; }
}
