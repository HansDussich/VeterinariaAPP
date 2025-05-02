using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace VETERINARIA_DB.Models;

public partial class Usuario
{
    public int UsuarioId { get; set; }

    public string? NombreUsuario { get; set; }

    public string? Contraseña { get; set; }

    public string? Email { get; set; }

    public string? Rol { get; set; }

    public DateTime? FechaCreacion { get; set; }

    [JsonIgnore]
    public virtual ICollection<LogAuditorium> LogAuditoria { get; set; } = new List<LogAuditorium>();
}
