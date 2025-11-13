import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";

interface LoginFormProps {
  onLogin: (username: string, isAdmin: boolean) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Por favor, insira um nome de usuário");
      return;
    }

    const users = JSON.parse(localStorage.getItem("academia_users") || "[]");
    const existingUser = users.find((u: any) => u.username === username);

    if (isCreating) {
      if (existingUser) {
        toast.error("Usuário já existe");
        return;
      }
      const isFirstUser = users.length === 0;
      users.push({ username, isAdmin: isFirstUser });
      localStorage.setItem("academia_users", JSON.stringify(users));
      toast.success("Conta criada com sucesso!");
      onLogin(username, isFirstUser);
    } else {
      if (!existingUser) {
        toast.error("Usuário não encontrado. Crie uma conta primeiro.");
        return;
      }
      onLogin(username, existingUser.isAdmin);
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 h-11 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                onClick={() => setIsCreating(false)}
              >
                Entrar
              </Button>
              <Button
                type="submit"
                variant="outline"
                className="flex-1 h-11 border-primary/30 hover:bg-primary/5"
                onClick={() => setIsCreating(true)}
              >
                Criar Conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
