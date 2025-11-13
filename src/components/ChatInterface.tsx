import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, Loader2, Sparkles, Upload, X } from "lucide-react";

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
  const [isDragging, setIsDragging] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...imageFiles]);
      toast.success(`${imageFiles.length} arquivo(s) anexado(s)`);
    } else {
      toast.error("Apenas arquivos de imagem são suportados");
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    let finalQuery = query;
    
    // Se houver imagens anexadas, adiciona ao contexto
    if (attachedFiles.length > 0) {
      finalQuery = `${query}\n\n[${attachedFiles.length} imagem(ns) anexada(s): ${attachedFiles.map(f => f.name).join(', ')}]`;
    }

    setIsLoading(true);
    const timestamp = new Date().toISOString();
    const providers = ["openai", "maritalk", "gemini"];

    try {
      const responsePromises = providers.map(async (provider) => {
        try {
          const content = await mockAICall(finalQuery, provider);
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
      const message: Message = { query: finalQuery, responses, timestamp };

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
      setAttachedFiles([]);
    } catch (error) {
      toast.error("Erro ao processar consulta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="space-y-4 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-2 text-primary" />
            <p className="text-lg font-medium text-foreground">Solte as imagens aqui</p>
            <p className="text-sm text-muted-foreground">Imagens serão anexadas à sua consulta</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
            {attachedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-background px-3 py-2 rounded-md border border-border/50 shadow-sm"
              >
                <span className="text-sm text-foreground truncate max-w-[150px]">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <Textarea
          placeholder="Digite sua pergunta para as IAs... (Arraste imagens aqui para anexar)"
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
