import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Languages, Loader2 } from "lucide-react";

const LANGUAGES = [
  { code: "pt", name: "Português" },
  { code: "en", name: "Inglês" },
  { code: "es", name: "Espanhol" },
  { code: "fr", name: "Francês" },
  { code: "de", name: "Alemão" },
];

interface TranslationPanelProps {
  textToTranslate: string;
}

export const TranslationPanel = ({ textToTranslate }: TranslationPanelProps) => {
  const [targetLang, setTargetLang] = useState("en");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!textToTranslate.trim()) {
      toast.error("Nenhum texto para traduzir");
      return;
    }

    setIsTranslating(true);
    try {
      // Simulação de tradução (em produção, usar deep-translator via Edge Function)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTranslatedText(
        `[Tradução simulada para ${LANGUAGES.find((l) => l.code === targetLang)?.name}]\n\n${textToTranslate}\n\n(Em produção, usar deep-translator via backend)`
      );
      toast.success("Texto traduzido com sucesso!");
    } catch (error) {
      toast.error("Erro ao traduzir texto");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5" />
          Tradução
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleTranslate}
            disabled={isTranslating || !textToTranslate.trim()}
            className="bg-gradient-to-r from-accent to-accent/90"
          >
            {isTranslating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Traduzir"
            )}
          </Button>
        </div>

        {translatedText && (
          <Textarea
            value={translatedText}
            readOnly
            className="min-h-[200px] bg-muted/50"
          />
        )}
      </CardContent>
    </Card>
  );
};
