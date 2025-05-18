import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Password recovery states
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/');
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (recoveryStep === 1) {
      // Step 1: Verify user exists
      setIsRecoveryLoading(true);
      try {
        const response = await fetch(`https://localhost:7290/api/usuarios`);
        const users = await response.json();
        
        const user = users.find((u: any) => 
          u.nombreUsuario === recoveryUsername && u.email === recoveryEmail
        );
        
        if (user) {
          setUserId(user.usuarioId);
          setRecoveryStep(2);
        } else {
          toast({
            title: "Error",
            description: "Usuario o email no encontrado",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al verificar usuario",
          variant: "destructive"
        });
      } finally {
        setIsRecoveryLoading(false);
      }
    } else if (recoveryStep === 2) {
      // Step 2: Change password
      if (newPassword !== confirmPassword) {
        toast({
          title: "Error",
          description: "Las contraseñas no coinciden",
          variant: "destructive"
        });
        return;
      }
      
      setIsRecoveryLoading(true);
      try {
        const response = await fetch(`https://localhost:7290/api/usuarios/${userId}/cambiar-contraseña/${newPassword}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          toast({
            title: "Éxito",
            description: "Contraseña actualizada correctamente",
          });
          resetRecoveryForm();
        } else {
          toast({
            title: "Error",
            description: "No se pudo actualizar la contraseña",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cambiar la contraseña",
          variant: "destructive"
        });
      } finally {
        setIsRecoveryLoading(false);
      }
    }
  };

  const resetRecoveryForm = () => {
    setIsRecoveryOpen(false);
    setRecoveryUsername('');
    setRecoveryEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setRecoveryStep(1);
    setUserId(null);
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
            <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  placeholder="Nombre de usuario"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <a 
                    href="#" 
                    className="text-sm text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsRecoveryOpen(true);
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
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
                ) : 'Iniciar Sesión'}
              </Button>
            </CardFooter>
          </form>
          <div className="px-6 pb-4 text-center">
            <Button 
              variant="link" 
              className="w-full"
              onClick={() => navigate('/register')}
            >
              ¿No tienes una cuenta? Regístrate
            </Button>
          </div>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          Sistema de Gestión Veterinaria
        </p>
      </div>

      {/* Password Recovery Dialog */}
      <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Recuperar Contraseña</DialogTitle>
            <DialogDescription>
              {recoveryStep === 1 
                ? "Ingresa tu nombre de usuario y correo electrónico para verificar tu identidad."
                : "Ingresa tu nueva contraseña."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecoverySubmit}>
            {recoveryStep === 1 ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="recovery-username" className="col-span-4">
                    Nombre de Usuario
                  </Label>
                  <Input
                    id="recovery-username"
                    className="col-span-4"
                    value={recoveryUsername}
                    onChange={(e) => setRecoveryUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="recovery-email" className="col-span-4">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="recovery-email"
                    type="email"
                    className="col-span-4"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new-password" className="col-span-4">
                    Nueva Contraseña
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    className="col-span-4"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="confirm-password" className="col-span-4">
                    Confirmar Contraseña
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="col-span-4"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetRecoveryForm}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isRecoveryLoading}
              >
                {isRecoveryLoading ? (
                  <>
                    <span className="animate-spin mr-2">&#10227;</span>
                    Procesando...
                  </>
                ) : recoveryStep === 1 ? 'Verificar' : 'Cambiar Contraseña'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
