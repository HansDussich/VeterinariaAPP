using System;
using System.Collections.Generic;

namespace VETERINARIA_DB.Models;

public partial class Pago
{
    public int PagoId { get; set; }

    public int? VentaId { get; set; }

    public decimal? Monto { get; set; }

    public string? MetodoPago { get; set; }

    public DateTime? FechaPago { get; set; }

    public string? Estado { get; set; }

    public virtual Venta? Venta { get; set; }
}
