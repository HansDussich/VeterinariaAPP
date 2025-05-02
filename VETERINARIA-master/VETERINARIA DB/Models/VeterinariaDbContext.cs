using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace VETERINARIA_DB.Models;

public partial class VeterinariaDbContext : DbContext
{
    public VeterinariaDbContext(DbContextOptions<VeterinariaDbContext> options)
        : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
#warning La cadena de conexión debe configurarse en Program.cs
        }
    }

    public virtual DbSet<Cita> Citas { get; set; }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<Empleado> Empleados { get; set; }

    public virtual DbSet<HistorialMedico> HistorialMedicos { get; set; }

    public virtual DbSet<Hospitalizacion> Hospitalizacions { get; set; }

    public virtual DbSet<LogAuditorium> LogAuditoria { get; set; }

    public virtual DbSet<Mascota> Mascotas { get; set; }

    public virtual DbSet<Pago> Pagos { get; set; }

    public virtual DbSet<Producto> Productos { get; set; }

    public virtual DbSet<Proveedore> Proveedores { get; set; }

    public virtual DbSet<Recordatorio> Recordatorios { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    public virtual DbSet<Venta> Ventas { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cita>(entity =>
        {
            entity.HasKey(e => e.CitaId).HasName("PK__Citas__F0E2D9D215D1FA9F");

            entity.Property(e => e.Confirmada).HasDefaultValue(false);
            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.FechaCita).HasColumnType("datetime");
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Motivo).HasMaxLength(255);

            entity.HasOne(d => d.Cliente).WithMany(p => p.Cita)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("FK__Citas__ClienteId__4BAC3F29");

            entity.HasOne(d => d.Mascota).WithMany(p => p.Cita)
                .HasForeignKey(d => d.MascotaId)
                .HasConstraintName("FK__Citas__MascotaId__4AB81AF0");

            entity.HasOne(d => d.Veterinario).WithMany(p => p.Cita)
                .HasForeignKey(d => d.VeterinarioId)
                .HasConstraintName("FK__Citas__Veterinar__4CA06362");
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.ClienteId).HasName("PK__Clientes__71ABD087E3C91AFD");

            entity.Property(e => e.Apellido).HasMaxLength(100);
            entity.Property(e => e.Correo).HasMaxLength(100);
            entity.Property(e => e.Direccion).HasMaxLength(200);
            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.Telefono).HasMaxLength(20);

            entity.HasOne(d => d.Veterinario).WithMany(p => p.Clientes)
                .HasForeignKey(d => d.VeterinarioId)
                .HasConstraintName("FK__Clientes__Veteri__4222D4EF");
        });

        modelBuilder.Entity<Empleado>(entity =>
        {
            entity.HasKey(e => e.EmpleadoId).HasName("PK__Empleado__958BE910F0973EC6");

            entity.Property(e => e.Apellido).HasMaxLength(100);
            entity.Property(e => e.Cargo).HasMaxLength(50);
            entity.Property(e => e.Contraseña).HasMaxLength(255);
            entity.Property(e => e.Correo).HasMaxLength(100);
            entity.Property(e => e.Estado).HasMaxLength(20);
            entity.Property(e => e.FechaIngreso)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FechaNacimiento).HasColumnType("datetime");
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.Telefono).HasMaxLength(20);
            entity.Property(e => e.Turno).HasMaxLength(50);
        });

        modelBuilder.Entity<HistorialMedico>(entity =>
        {
            entity.HasKey(e => e.HistorialId).HasName("PK__Historia__9752068FAC0DB1E2");

            entity.ToTable("HistorialMedico");

            entity.Property(e => e.Diagnostico).HasMaxLength(255);
            entity.Property(e => e.FechaConsulta).HasColumnType("datetime");
            entity.Property(e => e.Notas).HasMaxLength(255);
            entity.Property(e => e.Tratamiento).HasMaxLength(255);

            entity.HasOne(d => d.Mascota).WithMany(p => p.HistorialMedicos)
                .HasForeignKey(d => d.MascotaId)
                .HasConstraintName("FK__Historial__Masco__656C112C");

            entity.HasOne(d => d.Veterinario).WithMany(p => p.HistorialMedicos)
                .HasForeignKey(d => d.VeterinarioId)
                .HasConstraintName("FK__Historial__Veter__66603565");
        });

        modelBuilder.Entity<Hospitalizacion>(entity =>
        {
            entity.HasKey(e => e.HospitalizacionId).HasName("PK__Hospital__D1B950229631B438");

            entity.ToTable("Hospitalizacion");

            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.FechaAlta).HasColumnType("datetime");
            entity.Property(e => e.FechaIngreso)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.NotasTratamiento).HasMaxLength(255);

            entity.HasOne(d => d.Mascota).WithMany(p => p.Hospitalizacions)
                .HasForeignKey(d => d.MascotaId)
                .HasConstraintName("FK__Hospitali__Masco__59FA5E80");

            entity.HasOne(d => d.MedicoResponsableNavigation).WithMany(p => p.Hospitalizacions)
                .HasForeignKey(d => d.MedicoResponsable)
                .HasConstraintName("FK__Hospitali__Medic__5AEE82B9");
        });

        modelBuilder.Entity<LogAuditorium>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__LogAudit__5E548648C6BA25AC");

            entity.Property(e => e.Accion).HasMaxLength(255);
            entity.Property(e => e.Detalles).HasMaxLength(500);
            entity.Property(e => e.Fecha)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Usuario).WithMany(p => p.LogAuditoria)
                .HasForeignKey(d => d.UsuarioId)
                .HasConstraintName("FK__LogAudito__Usuar__6A30C649");
        });

        modelBuilder.Entity<Mascota>(entity =>
        {
            entity.HasKey(e => e.MascotaId).HasName("PK__Mascotas__8DBC413CD17BA36A");

            entity.Property(e => e.Estado).HasMaxLength(20);
            entity.Property(e => e.FechaNacimiento).HasColumnType("datetime");
            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Genero).HasMaxLength(10);
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.Raza).HasMaxLength(50);
            entity.Property(e => e.Tipo).HasMaxLength(50);

            entity.HasOne(d => d.Cliente).WithMany(p => p.Mascota)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("FK__Mascotas__Client__45F365D3");
        });

        modelBuilder.Entity<Pago>(entity =>
        {
            entity.HasKey(e => e.PagoId).HasName("PK__Pagos__F00B613871C51F7F");

            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.FechaPago)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.MetodoPago).HasMaxLength(50);
            entity.Property(e => e.Monto).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Venta).WithMany(p => p.Pagos)
                .HasForeignKey(d => d.VentaId)
                .HasConstraintName("FK__Pagos__VentaId__5629CD9C");
        });

        modelBuilder.Entity<Producto>(entity =>
        {
            entity.HasKey(e => e.ProductoId).HasName("PK__Producto__A430AEA31490F477");

            entity.Property(e => e.Categoria).HasMaxLength(50);
            entity.Property(e => e.Descripcion).HasMaxLength(255);
            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.Precio).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Proveedor).WithMany(p => p.Productos)
                .HasForeignKey(d => d.ProveedorId)
                .HasConstraintName("FK__Productos__Prove__3B75D760");
        });

        modelBuilder.Entity<Proveedore>(entity =>
        {
            entity.HasKey(e => e.ProveedorId).HasName("PK__Proveedo__61266A5926CAF0A8");

            entity.Property(e => e.Correo).HasMaxLength(100);
            entity.Property(e => e.Direccion).HasMaxLength(200);
            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.Telefono).HasMaxLength(20);
        });

        modelBuilder.Entity<Recordatorio>(entity =>
        {
            entity.HasKey(e => e.RecordatorioId).HasName("PK__Recordat__9E994668CA14143C");

            entity.Property(e => e.Descripcion).HasMaxLength(255);
            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.FechaNotificacion).HasColumnType("datetime");
            entity.Property(e => e.Tipo).HasMaxLength(50);

            entity.HasOne(d => d.Mascota).WithMany(p => p.Recordatorios)
                .HasForeignKey(d => d.MascotaId)
                .HasConstraintName("FK__Recordato__Masco__5DCAEF64");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.UsuarioId).HasName("PK__Usuarios__2B3DE7B873935DD5");

            entity.HasIndex(e => e.NombreUsuario, "UQ__Usuarios__6B0F5AE0CDAAD5B1").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Usuarios__A9D105345214DAED").IsUnique();

            entity.Property(e => e.Contraseña).HasMaxLength(255);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.NombreUsuario).HasMaxLength(100);
            entity.Property(e => e.Rol).HasMaxLength(50);
        });

        modelBuilder.Entity<Venta>(entity =>
        {
            entity.HasKey(e => e.VentaId).HasName("PK__Ventas__5B4150AC40522BB6");

            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.FacturaGenerada).HasDefaultValue(false);
            entity.Property(e => e.FechaVenta)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.MetodoPago).HasMaxLength(50);
            entity.Property(e => e.MontoTotal).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Cliente).WithMany(p => p.Venta)
                .HasForeignKey(d => d.ClienteId)
                .HasConstraintName("FK__Ventas__ClienteI__52593CB8");

            entity.HasOne(d => d.Producto).WithMany(p => p.Venta)
                .HasForeignKey(d => d.ProductoId)
                .HasConstraintName("FK__Ventas__Producto__5165187F");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
