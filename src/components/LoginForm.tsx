import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GraduationCap, Eye, EyeOff, Shield } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email é obrigatório")
    .email("Email inválido")
    .max(255, "Email muito longo"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(100, "Senha muito longa"),
});

const signupSchema = loginSchema.extend({
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(100, "Senha muito longa")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

interface LoginFormProps {
  onLogin: (username: string, isAdmin: boolean) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = loginSchema.parse({
        email: loginEmail,
        password: loginPassword,
      });

      const users = JSON.parse(localStorage.getItem("academia_users") || "[]");
      const existingUser = users.find(
        (u: any) => u.email === validated.email && u.password === validated.password
      );

      if (!existingUser) {
        toast.error("Email ou senha incorretos");
        return;
      }

      toast.success("Login realizado com sucesso!");
      onLogin(existingUser.email, existingUser.isAdmin);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error("Erro ao fazer login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = signupSchema.parse({
        email: signupEmail,
        password: signupPassword,
        confirmPassword: confirmPassword,
      });

      const users = JSON.parse(localStorage.getItem("academia_users") || "[]");
      const existingUser = users.find((u: any) => u.email === validated.email);

      if (existingUser) {
        toast.error("Este email já está cadastrado");
        return;
      }

      const isFirstUser = users.length === 0;
      users.push({
        email: validated.email,
        password: validated.password,
        isAdmin: isFirstUser,
      });
      localStorage.setItem("academia_users", JSON.stringify(users));

      toast.success(
        isFirstUser
          ? "Conta de administrador criada com sucesso!"
          : "Conta criada com sucesso!"
      );
      onLogin(validated.email, isFirstUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error("Erro ao criar conta");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-strong)] animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-2">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AcademIA
          </CardTitle>
          <CardDescription className="text-base">
            Plataforma de pesquisa com múltiplas IAs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20 mb-4">
                  <Shield className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">Requisitos de senha:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Mínimo 8 caracteres</li>
                      <li>Letra maiúscula e minúscula</li>
                      <li>Pelo menos um número</li>
                      <li>Caractere especial (!@#$%...)</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-11"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
