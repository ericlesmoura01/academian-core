import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Key } from "lucide-react";

interface ApiManagerProps {
  isAdmin: boolean;
}

const API_KEYS = [
  { key: "OPENAI_API_KEY", label: "OpenAI API Key", placeholder: "sk-..." },
  { key: "MARITALK_API_KEY", label: "Maritalk API Key", placeholder: "..." },
  { key: "GEMINI_API_KEY", label: "Gemini API Key", placeholder: "..." },
];

export const ApiManager = ({ isAdmin }: ApiManagerProps) => {
  const [keys, setKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem("academia_api_keys");
    if (stored) setKeys(JSON.parse(stored));
  }, []);

  const handleSave = (keyName: string, value: string) => {
    const newKeys = { ...keys, [keyName]: value };
    setKeys(newKeys);
    localStorage.setItem("academia_api_keys", JSON.stringify(newKeys));
    toast.success(`${keyName} salva com sucesso`);
  };

  if (!isAdmin) {
    return (
      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Gerenciamento de APIs
          </CardTitle>
          <CardDescription>Acesso restrito a administradores</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Gerenciamento de APIs
        </CardTitle>
        <CardDescription>Configure as chaves de API das IAs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {API_KEYS.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <div className="flex gap-2">
              <Input
                id={key}
                type="password"
                placeholder={placeholder}
                value={keys[key] || ""}
                onChange={(e) => setKeys({ ...keys, [key]: e.target.value })}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={() => handleSave(key, keys[key] || "")}
                className="shrink-0"
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
