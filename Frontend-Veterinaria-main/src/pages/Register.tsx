import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Activity } from 'lucide-react';

interface RegisterFormData {
  // Datos del cliente
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  correo: string;
  // Credenciales de usuario
  nombreUsuario: string;
  contraseña: string;
  confirmarContraseña: string;
}

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    correo: '',
    nombreUsuario: '',
    contraseña: '',
    confirmarContraseña: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.contraseña !== formData.confirmarContraseña) {
      toast({
        title: 'Error de validación',
        description: 'Las contraseñas no coinciden.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Primero creamos el usuario
      const userResponse = await fetch('https://localhost:7290/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreUsuario: formData.nombreUsuario,
          contraseña: formData.contraseña,
          email: formData.correo,
          rol: 'Cliente'
        })
      });

      if (!userResponse.ok) {
        throw new Error('Error al crear el usuario');
      }

      // Luego creamos el cliente
      const clientResponse = await fetch('https://localhost:7290/Guardar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          direccion: formData.direccion,
          telefono: formData.telefono,
          correo: formData.correo,
          fechaRegistro: new Date().toISOString()
        })
      });

      if (!clientResponse.ok) {
        throw new Error('Error al crear el cliente');
      }

      toast({
        title: '¡Registro exitoso!',
        description: 'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Error al registrar:', error);
      toast({
        title: 'Error al registrar',
        description: 'No se pudo completar el registro. Por favor, intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/10 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="h-8 w-8" />
            <h1 className="text-3xl font-bold">VetCare Central</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Registro de Cliente</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus datos para crear una cuenta
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Datos personales */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Tu nombre"
                  required
                  value={formData.nombre}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  name="apellido"
                  placeholder="Tu apellido"
                  required
                  value={formData.apellido}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  placeholder="Tu dirección"
                  required
                  value={formData.direccion}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  placeholder="Tu número de teléfono"
                  required
                  value={formData.telefono}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={formData.correo}
                  onChange={handleInputChange}
                />
              </div>

              {/* Separador */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Credenciales de acceso
                  </span>
                </div>
              </div>

              {/* Credenciales de usuario */}
              <div className="space-y-2">
                <Label htmlFor="nombreUsuario">Nombre de usuario</Label>
                <Input
                  id="nombreUsuario"
                  name="nombreUsuario"
                  placeholder="Elige un nombre de usuario"
                  required
                  value={formData.nombreUsuario}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contraseña">Contraseña</Label>
                <Input
                  id="contraseña"
                  name="contraseña"
                  type="password"
                  placeholder="Elige una contraseña"
                  required
                  value={formData.contraseña}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarContraseña">Confirmar contraseña</Label>
                <Input
                  id="confirmarContraseña"
                  name="confirmarContraseña"
                  type="password"
                  placeholder="Confirma tu contraseña"
                  required
                  value={formData.confirmarContraseña}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">&#10227;</span>
                    Procesando...
                  </>
                ) : 'Registrarse'}
              </Button>
              <Button 
                type="button" 
                variant="link"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register; 