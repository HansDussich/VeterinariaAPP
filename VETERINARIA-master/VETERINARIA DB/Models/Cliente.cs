using System;
using System.Collections.Generic;

namespace VETERINARIA_DB.Models;

public partial class Cliente
{
    public int ClienteId { get; set; }

    public string? Nombre { get; set; }

    public string? Apellido { get; set; }

    public string? Direccion { get; set; }

    public string? Telefono { get; set; }

    public string? Correo { get; set; }

    public DateTime? FechaRegistro { get; set; }

    public int? VeterinarioId { get; set; }

    public virtual ICollection<Cita> Cita { get; set; } = new List<Cita>();

    public virtual ICollection<Mascota> Mascota { get; set; } = new List<Mascota>();

    public virtual ICollection<Venta> Venta { get; set; } = new List<Venta>();

    public virtual Empleado? Veterinario { get; set; }
}
