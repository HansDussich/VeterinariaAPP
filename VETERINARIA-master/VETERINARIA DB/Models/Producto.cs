using System;
using System.Collections.Generic;

namespace VETERINARIA_DB.Models;

public partial class Producto
{
    public int ProductoId { get; set; }

    public string? Nombre { get; set; }

    public string? Categoria { get; set; }

    public string? Descripcion { get; set; }

    public decimal? Precio { get; set; }

    public int? Stock { get; set; }

    public DateTime? FechaRegistro { get; set; }

    public int? ProveedorId { get; set; }

    public virtual Proveedore? Proveedor { get; set; }

    public virtual ICollection<Venta> Venta { get; set; } = new List<Venta>();
}
