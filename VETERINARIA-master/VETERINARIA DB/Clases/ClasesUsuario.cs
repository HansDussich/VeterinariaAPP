using System.Threading;
using System;
using System.Collections.Generic;
using System.Linq;
using VETERINARIA_DB.Models;
using System.Text;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using System.Text;


namespace VETERINARIA_DB.Clases
{
    public class ClasesUsuario
    {


        private readonly VeterinariaDbContext _context;

        public ClasesUsuario(VeterinariaDbContext context)
        {
            _context = context;
        }
        public string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                StringBuilder builder = new StringBuilder();
                foreach (var b in bytes)
                    builder.Append(b.ToString("x2")); 
                return builder.ToString();
            }
        }

        public string PostUsuario(Usuario dato)
        {
            try
            {
                if (!string.IsNullOrEmpty(dato.Contraseña))
                {
                    dato.Contraseña = HashPassword(dato.Contraseña);
                }

                dato.FechaCreacion = DateTime.Now; // opcional si querés setearlo automáticamente

                _context.Usuarios.Add(dato);
                _context.SaveChanges();

                return "Usuario registrado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al registrar usuario: {ex.Message}";
            }
        }
            public Usuario GetUsuario(int id)
        {
            try
            {
                return _context.Usuarios.Find(id);
            }
            catch (Exception)
            {
                return null;
            }
        }

        public List<Usuario> GetUsuarios()
        {
            try
            {
                return _context.Usuarios.ToList();
            }
            catch (Exception)
            {
                return new List<Usuario>();
            }
        }

        public string DeleteUsuario(int id)
        {
            try
            {
                var usuario = _context.Usuarios.Find(id);
                if (usuario != null)
                {
                    _context.Usuarios.Remove(usuario);
                    _context.SaveChanges();
                    return "Usuario eliminado exitosamente";
                }
                else
                {
                    return "Usuario no encontrado";
                }
            }
            catch (Exception ex)
            {
                return $"Error al eliminar usuario: {ex.Message}";
            }
        }
        public string PutUsuario(Usuario dato)
        {
            try
            {
                var usuarioExistente = _context.Usuarios.Find(dato.UsuarioId);
                if (usuarioExistente == null)
                    return "Usuario no encontrado";

                usuarioExistente.NombreUsuario = dato.NombreUsuario;
                usuarioExistente.Email = dato.Email;
                usuarioExistente.Rol = dato.Rol;

                if (!string.IsNullOrEmpty(dato.Contraseña))
                {
                    usuarioExistente.Contraseña = HashPassword(dato.Contraseña);
                }

                _context.Usuarios.Update(usuarioExistente);
                _context.SaveChanges();

                return "Usuario actualizado exitosamente";
            }
            catch (Exception ex)
            {
                return $"Error al actualizar usuario: {ex.Message}";
            }
        }


        public bool Login(string NombreUsuario, string contraseña)
        {
            try
            {
                string hashedPassword = HashPassword(contraseña);
                Console.WriteLine($"Login attempt - Username: {NombreUsuario}, Hashed Password: {hashedPassword}");
                
                var usuario = _context.Usuarios.FirstOrDefault(u => u.NombreUsuario == NombreUsuario);
                if (usuario != null)
                {
                    Console.WriteLine($"User found - Stored Hash: {usuario.Contraseña}");
                }
                else
                {
                    Console.WriteLine("User not found");
                }
                
                var result = usuario != null && usuario.Contraseña == hashedPassword;
                Console.WriteLine($"Login result: {result}");
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                return false;
            } 
        }

        public string CambiarContraseña(int id, string nuevaContraseña)
        {
            try
            {
                var usuario = _context.Usuarios.Find(id);
                if (usuario != null)
                {
                    usuario.Contraseña = HashPassword(nuevaContraseña);
                    _context.SaveChanges();
                    return "Contraseña cambiada exitosamente";
                }
                else
                {
                    return "Usuario no encontrado";
                }
            }
            catch (Exception ex)
            {
                return $"Error al cambiar contraseña: {ex.Message}";
            }
        }




    }
}
