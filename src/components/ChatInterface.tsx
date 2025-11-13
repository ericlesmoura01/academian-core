import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Loader2, Sparkles } from "lucide-react";

interface Message {
  query: string;
  responses: Array<{ provider: string; content: string; hasError: boolean }>;
  timestamp: string;
}

interface ChatInterfaceProps {
  onNewMessage: (message: Message) => void;
}

export const ChatInterface = ({ onNewMessage }: ChatInterfaceProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<Message | null>(null);

  const mockAICall = async (prompt: string, provider: string): Promise<string> => {
    // Simula chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const apiKeys = JSON.parse(localStorage.getItem("academia_api_keys") || "{}");
    const keyName = `${provider.toUpperCase()}_API_KEY`;
    
    if (!apiKeys[keyName]) {
      throw new Error(`API ${provider} não configurada`);
    }

    return `Resposta da ${provider}:\n\nEsta é uma resposta simulada para: "${prompt}"\n\nEm produção, esta chamada seria feita via Edge Function para proteger suas chaves de API.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    const timestamp = new Date().toISOString();
    const providers = ["openai", "maritalk", "gemini"];

    try {
      const responsePromises = providers.map(async (provider) => {
        try {
          const content = await mockAICall(query, provider);
          return { provider, content, hasError: false };
        } catch (error) {
          return {
            provider,
            content: `[Erro ${provider}] ${error instanceof Error ? error.message : "Erro desconhecido"}`,
            hasError: true,
          };
        }
      });

      const responses = await Promise.all(responsePromises);
      const message: Message = { query, responses, timestamp };

      setCurrentResponse(message);
      onNewMessage(message);

      const errorCount = responses.filter((r) => r.hasError).length;
      if (errorCount === responses.length) {
        toast.error("Todas as APIs falharam. Verifique as configurações.");
      } else if (errorCount > 0) {
        toast.warning(`${errorCount} API(s) falharam`);
      } else {
        toast.success("Consulta realizada com sucesso!");
      }

      setQuery("");
    } catch (error) {
      toast.error("Erro ao processar consulta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Digite sua pergunta para as IAs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[120px] resize-none"
          disabled={isLoading}
        />
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Consultando IAs...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar Consulta
            </>
          )}
        </Button>
      </form>

      {currentResponse && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Respostas agregadas</span>
          </div>
          {currentResponse.responses.map((response, idx) => (
            <Card
              key={idx}
              className={`p-4 ${
                response.hasError
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-accent/30 bg-accent/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant={response.hasError ? "destructive" : "default"}
                  className="capitalize"
                >
                  {response.provider}
                </Badge>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                {response.content}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
