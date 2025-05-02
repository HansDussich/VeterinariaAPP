using Microsoft.EntityFrameworkCore;
using VETERINARIA_DB.Clases;
using VETERINARIA_DB.Models;

var builder = WebApplication.CreateBuilder(args);

// Leer la cadena de conexión desde appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Agregar el contexto de base de datos
builder.Services.AddDbContext<VeterinariaDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Inyectar dependencias
builder.Services.AddScoped<ClasesCliente>();
builder.Services.AddScoped<ClasesCita>();
builder.Services.AddScoped<ClasesEmpleado>();
builder.Services.AddScoped<ClasesHistorialMedico>();
builder.Services.AddScoped<ClasesHospitalizacion>();
builder.Services.AddScoped<ClasesLogAuditorium>();
builder.Services.AddScoped<ClasesMascota>();
builder.Services.AddScoped<ClasesPago>();
builder.Services.AddScoped<ClasesProducto>();
builder.Services.AddScoped<ClasesProveedore>();
builder.Services.AddScoped<ClasesRecordatorio>();
builder.Services.AddScoped<ClasesUsuario>();
builder.Services.AddScoped<ClasesVenta>();


// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("NuevaPolitica", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configurar Swagger solo en desarrollo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Aplicar CORS
app.UseCors("NuevaPolitica");

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();


// -----------------------------
// Endpoints de Clientes
// -----------------------------

app.MapPost("Guardar", (Cliente dato, ClasesCliente dao) =>
{
    return dao.Guardar(dato);
}).WithTags("Clientes");

app.MapDelete("EliminarCliente", (int id, ClasesCliente dao) =>
{
    return dao.EliminarCliente(id);
}).WithTags("Clientes");

app.MapGet("MostrarClientePorId", (int id, ClasesCliente dao) =>
{
    return dao.MostrarClientePorId(id);
}).WithTags("Clientes");

app.MapGet("MostrarClientes", (ClasesCliente dao) =>
{
    return dao.MostrarClientes();
}).WithTags("Clientes");

app.MapPut("ActualizarCliente", (Cliente dato, ClasesCliente dao) =>
{
    return dao.ActualizarCliente(dato);
}).WithTags("Clientes");


// -----------------------------
// Endpoints de Citas
// -----------------------------

app.MapPost("GuardarCita", (Cita dato, ClasesCita dao) =>
{
    return dao.PostCita(dato);
}).WithTags("Citas");

app.MapGet("ObtenerCitaPorId/{id}", (int id, ClasesCita dao) =>
{
    return dao.GetCita(id);
}).WithTags("Citas");

app.MapGet("ListarCitas", (ClasesCita dao) =>
{
    return dao.GetCitas();
}).WithTags("Citas");

app.MapPut("ActualizarCita", (Cita dato, ClasesCita dao) =>
{
    return dao.PutCita(dato);
}).WithTags("Citas");

app.MapDelete("EliminarCita/{id}", (int id, ClasesCita dao) =>
{
    return dao.DeleteCita(id);
}).WithTags("Citas");

// -----------------------------
// Endpoints de Empleados
// -----------------------------

app.MapPost("GuardarEmpleado", (Empleado dato, ClasesEmpleado dao) =>
{
    return dao.PostEmpleado(dato);
}).WithTags("Empleados");

app.MapGet("ObtenerEmpleadoPorId/{id}", (int id, ClasesEmpleado dao) =>
{
    return dao.GetEmpleado(id);
}).WithTags("Empleados");

app.MapGet("ListarEmpleados", (ClasesEmpleado dao) =>
{
    return dao.GetEmpleados();
}).WithTags("Empleados");

app.MapGet("ListarVeterinarios", (ClasesEmpleado dao) =>
{
    return dao.GetVeterinarios();
}).WithTags("Empleados");

app.MapPut("ActualizarEmpleado", (Empleado dato, ClasesEmpleado dao) =>
{
    return dao.PutEmpleado(dato);
}).WithTags("Empleados");

app.MapDelete("EliminarEmpleado/{id}", (int id, ClasesEmpleado dao) =>
{
    return dao.DeleteEmpleado(id);
}).WithTags("Empleados");

// -----------------------------
// Endpoints de HistorialMedicos
// -----------------------------

app.MapPost("GuardarHistorialMedico", (HistorialMedico dato, ClasesHistorialMedico dao) =>
{
    return dao.PostHistorialMedico(dato);
}).WithTags("HistorialMedicos");

app.MapGet("ObtenerHistorialMedicoPorId/{id}", (int id, ClasesHistorialMedico dao) =>
{
    return dao.GetHistorialMedico(id);
}).WithTags("HistorialMedicos");

app.MapGet("ListarHistorialMedicos", (ClasesHistorialMedico dao) =>
{
    return dao.GetHistorialMedicos();
}).WithTags("HistorialMedicos");

app.MapPut("ActualizarHistorialMedico", (HistorialMedico dato, ClasesHistorialMedico dao) =>
{
    return dao.PutHistorialMedico(dato);
}).WithTags("HistorialMedicos");

app.MapDelete("EliminarHistorialMedico/{id}", (int id, ClasesHistorialMedico dao) =>
{
    return dao.DeleteHistorialMedico(id);
}).WithTags("HistorialMedicos");


// -----------------------------
// Endpoints de Hospitalizaciones
// -----------------------------

app.MapPost("GuardarHospitalizacion", (Hospitalizacion dato, ClasesHospitalizacion dao) =>
{
    return dao.PostHospitalizacion(dato);
}).WithTags("Hospitalizaciones");

app.MapGet("ObtenerHospitalizacionPorId/{id}", (int id, ClasesHospitalizacion dao) =>
{
    return dao.GetHospitalizacion(id);
}).WithTags("Hospitalizaciones");

app.MapGet("ListarHospitalizaciones", (ClasesHospitalizacion dao) =>
{
    return dao.GetHospitalizaciones();
}).WithTags("Hospitalizaciones");

app.MapPut("ActualizarHospitalizacion", (Hospitalizacion dato, ClasesHospitalizacion dao) =>
{
    return dao.PutHospitalizacion(dato);
}).WithTags("Hospitalizaciones");

app.MapDelete("EliminarHospitalizacion/{id}", (int id, ClasesHospitalizacion dao) =>
{
    return dao.DeleteHospitalizacion(id);
}).WithTags("Hospitalizaciones");

// -----------------------------
// Endpoints de LogAuditoriumes
// -----------------------------

app.MapPost("GuardarLogAuditorium", (LogAuditorium dato, ClasesLogAuditorium dao) =>
{
    return dao.PostLogAuditorium(dato);
}).WithTags("LogAuditoriumes");

app.MapGet("ObtenerLogAuditoriumPorId/{id}", (int id, ClasesLogAuditorium dao) =>
{
    return dao.GetLogAuditorium(id);
}).WithTags("LogAuditoriumes");

app.MapGet("ListarLogAuditoriumes", (ClasesLogAuditorium dao) =>
{
    return dao.GetLogAuditoria();
}).WithTags("LogAuditoriumes");

app.MapPut("ActualizarLogAuditorium", (LogAuditorium dato, ClasesLogAuditorium dao) =>
{
    return dao.PutLogAuditorium(dato);
}).WithTags("LogAuditoriumes");

app.MapDelete("EliminarLogAuditorium/{id}", (int id, ClasesLogAuditorium dao) =>
{
    return dao.DeleteLogAuditorium(id);
}).WithTags("LogAuditoriumes");

// -----------------------------
// Endpoints de Mascotas
// -----------------------------

app.MapPost("GuardarMascota", (Mascota dato, ClasesMascota dao) =>
{
    return dao.PostMascota(dato);
}).WithTags("Mascotas");

app.MapGet("ObtenerMascotaPorId/{id}", (int id, ClasesMascota dao) =>
{
    return dao.GetMascota(id);
}).WithTags("Mascotas");

app.MapGet("ListarMascotas", (ClasesMascota dao) =>
{
    return dao.GetMascotas();
}).WithTags("Mascotas");

app.MapPut("ActualizarMascota", (Mascota dato, ClasesMascota dao) =>
{
    return dao.PutMascota(dato);
}).WithTags("Mascotas");

app.MapDelete("EliminarMascota/{id}", (int id, ClasesMascota dao) =>
{
    return dao.DeleteMascota(id);
}).WithTags("Mascotas");

// -----------------------------
// Endpoints de Pagos
// -----------------------------

app.MapPost("GuardarPago", (Pago dato, ClasesPago dao) =>
{
    return dao.PostPago(dato);
}).WithTags("Pagos");

app.MapGet("ObtenerPagoPorId/{id}", (int id, ClasesPago dao) =>
{
    return dao.GetPago(id);
}).WithTags("Pagos");

app.MapGet("ListarPagos", (ClasesPago dao) =>
{
    return dao.GetPagos();
}).WithTags("Pagos");

app.MapPut("ActualizarPago", (Pago dato, ClasesPago dao) =>
{
    return dao.PutPago(dato);
}).WithTags("Pagos");

app.MapDelete("EliminarPago/{id}", (int id, ClasesPago dao) =>
{
    return dao.DeletePago(id);
}).WithTags("Pagos");

// -----------------------------
// Endpoints de Productos
// -----------------------------

app.MapPost("GuardarProducto", (Producto dato, ClasesProducto dao) =>
{
    return dao.PostProducto(dato);
}).WithTags("Productos");

app.MapGet("ObtenerProductoPorId/{id}", (int id, ClasesProducto dao) =>
{
    return dao.GetProducto(id);
}).WithTags("Productos");

app.MapGet("ListarProductos", (ClasesProducto dao) =>
{
    return dao.GetProductos();
}).WithTags("Productos");

app.MapPut("ActualizarProducto", (Producto dato, ClasesProducto dao) =>
{
    return dao.PutProducto(dato);
}).WithTags("Productos");

app.MapDelete("EliminarProducto/{id}", (int id, ClasesProducto dao) =>
{
    return dao.DeleteProducto(id);
}).WithTags("Productos");

// -----------------------------
// Endpoints de Proveedores
// -----------------------------

app.MapPost("GuardarProveedore", (Proveedore dato, ClasesProveedore dao) =>
{
    return dao.PostProveedor(dato);
}).WithTags("Proveedores");

app.MapGet("ObtenerProveedorePorId/{id}", (int id, ClasesProveedore dao) =>
{
    return dao.GetProveedor(id);
}).WithTags("Proveedores");

app.MapGet("ListarProveedores", (ClasesProveedore dao) =>
{
    return dao.GetProveedores();
}).WithTags("Proveedores");

app.MapPut("PostProveedor", (Proveedore dato, ClasesProveedore dao) =>
{
    return dao.PutProveedor(dato);
}).WithTags("Proveedores");

app.MapDelete("EliminarProveedore/{id}", (int id, ClasesProveedore dao) =>
{
    return dao.DeleteProveedor(id);
}).WithTags("Proveedores");

// -----------------------------
// Endpoints de Recordatorio
// -----------------------------

app.MapPost("GuardarRecordatorio", (Recordatorio dato, ClasesRecordatorio dao) =>
{
    return dao.PostRecordatorio(dato);
}).WithTags("Recordatorio");

app.MapGet("ObtenerRecordatorioPorId/{id}", (int id, ClasesRecordatorio dao) =>
{
    return dao.GetRecordatorio(id);
}).WithTags("Recordatorio");

app.MapGet("ListarRecordatorio", (ClasesRecordatorio dao) =>
{
    return dao.GetRecordatorios();
}).WithTags("Recordatorio");

app.MapPut("PostRecordatorio", (Recordatorio dato, ClasesRecordatorio dao) =>
{
    return dao.PutRecordatorio(dato);
}).WithTags("Recordatorio");

app.MapDelete("EliminarRecordatorio/{id}", (int id, ClasesRecordatorio dao) =>
{
    return dao.DeleteRecordatorio(id);
}).WithTags("Recordatorio");

// -----------------------------
// Endpoints de Usuario
// -----------------------------

// Crear nuevo usuario
app.MapPost("api/usuarios", (Usuario dato, ClasesUsuario dao) =>
{
    return dao.PostUsuario(dato);
}).WithTags("Usuario");

// Obtener usuario por ID
app.MapGet("api/usuarios/{id}", (int id, ClasesUsuario dao) =>
{
    return dao.GetUsuario(id);
}).WithTags("Usuario");

// Listar todos los usuarios
app.MapGet("api/usuarios", (ClasesUsuario dao) =>
{
    return dao.GetUsuarios();
}).WithTags("Usuario");

// Actualizar usuario existente
app.MapPut("api/usuarios", (Usuario dato, ClasesUsuario dao) =>
{
    return dao.PutUsuario(dato);
}).WithTags("Usuario");

// Eliminar usuario por ID
app.MapDelete("api/usuarios/{id}", (int id, ClasesUsuario dao) =>
{
    return dao.DeleteUsuario(id);
}).WithTags("Usuario");

// Login (preferiblemente debería ser un POST con body, pero lo dejamos así si estás usando Swagger)
app.MapPost("api/usuarios/login", (string nombreUsuario, string contraseña, ClasesUsuario dao) =>
{
    var success = dao.Login(nombreUsuario, contraseña);
    if (success)
    {
        var usuario = dao.GetUsuarios().FirstOrDefault(u => u.NombreUsuario == nombreUsuario);
        return Results.Ok(new { 
            success = true,
            user = new {
                id = usuario.UsuarioId,
                name = usuario.NombreUsuario,
                email = usuario.Email,
                role = usuario.Rol
            }
        });
    }
    return Results.Unauthorized();
}).WithTags("Usuarios");

// Cambiar contraseña (nuevo endpoint)
app.MapPut("api/usuarios/{id}/cambiar-contraseña/{nuevaContraseña}", (int id, string nuevaContraseña, ClasesUsuario dao) =>
{
    return dao.CambiarContraseña(id, nuevaContraseña);
}).WithTags("Usuario");


// -----------------------------
// Endpoints de Venta
// -----------------------------

app.MapPost("GuardarVenta", (Venta dato, ClasesVenta dao) =>
{
    return dao.PostVenta(dato);
}).WithTags("Venta");

app.MapGet("ObtenerVentaPorId/{id}", (int id, ClasesVenta dao) =>
{
    return dao.GetVenta(id);
}).WithTags("Venta");

app.MapGet("ListarVenta", (ClasesVenta dao) =>
{
    return dao.GetVentas();
}).WithTags("Venta");

app.MapPut("PostVenta", (Venta dato, ClasesVenta dao) =>
{
    return dao.PutVenta(dato);
}).WithTags("Venta");

app.MapDelete("EliminarVenta/{id}", (int id, ClasesVenta dao) =>
{
    return dao.DeleteVenta(id);
}).WithTags("Venta");


app.Run();

