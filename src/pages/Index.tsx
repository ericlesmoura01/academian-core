import { useState, useEffect } from "react";
import { LoginForm } from "@/components/LoginForm";
import { ChatInterface } from "@/components/ChatInterface";
import { HistorySidebar } from "@/components/HistorySidebar";
import { ApiManager } from "@/components/ApiManager";
import { TranslationPanel } from "@/components/TranslationPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Settings, MessageSquare, GraduationCap } from "lucide-react";

interface Message {
  query: string;
  responses: Array<{ provider: string; content: string; hasError: boolean }>;
  timestamp: string;
}

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("academia_history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const handleLogin = (username: string, admin: boolean) => {
    setCurrentUser(username);
    setIsAdmin(admin);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
  };

  const handleNewMessage = (message: Message) => {
    const newHistory = [message, ...history].slice(0, 100);
    setHistory(newHistory);
    localStorage.setItem("academia_history", JSON.stringify(newHistory));
    
    // Prepara texto para tradução (todas as respostas válidas)
    const validResponses = message.responses
      .filter((r) => !r.hasError)
      .map((r) => r.content)
      .join("\n\n");
    setSelectedText(validResponses);
  };

  const handleSelectHistoryItem = (item: Message) => {
    const validResponses = item.responses
      .filter((r) => !r.hasError)
      .map((r) => r.content)
      .join("\n\n");
    setSelectedText(validResponses);
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-[var(--shadow-soft)]">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AcademIA
              </h1>
              <p className="text-xs text-muted-foreground">Olá, {currentUser}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - History */}
          <aside className="lg:col-span-1">
            <HistorySidebar history={history} onSelectItem={handleSelectHistoryItem} />
          </aside>

          {/* Main Area */}
          <section className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-12">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Consulta</span>
                </TabsTrigger>
                <TabsTrigger value="translate" className="flex items-center gap-2">
                  <span className="hidden sm:inline">Tradução</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">APIs</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-6">
                <ChatInterface onNewMessage={handleNewMessage} />
              </TabsContent>

              <TabsContent value="translate" className="mt-6">
                <TranslationPanel textToTranslate={selectedText} />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <ApiManager isAdmin={isAdmin} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
