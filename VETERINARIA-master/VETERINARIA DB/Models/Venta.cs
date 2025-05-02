using System;
using System.Collections.Generic;

namespace VETERINARIA_DB.Models;

public partial class Venta
{
    public int VentaId { get; set; }

    public int? ProductoId { get; set; }

    public int? ClienteId { get; set; }

    public DateTime? FechaVenta { get; set; }

    public decimal? MontoTotal { get; set; }

    public string? MetodoPago { get; set; }

    public string? Estado { get; set; }

    public bool? FacturaGenerada { get; set; }

    public virtual Cliente? Cliente { get; set; }

    public virtual ICollection<Pago> Pagos { get; set; } = new List<Pago>();

    public virtual Producto? Producto { get; set; }
}
