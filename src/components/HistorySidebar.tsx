import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare } from "lucide-react";

interface HistoryItem {
  query: string;
  responses: Array<{ provider: string; hasError: boolean }>;
  timestamp: string;
}

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
}

export const HistorySidebar = ({ history, onSelectItem }: HistorySidebarProps) => {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="h-full shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5" />
          Histórico
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2 p-4">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma consulta ainda
              </p>
            ) : (
              history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectItem(item)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/10 transition-colors space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <p className="text-sm font-medium line-clamp-2">{item.query}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {item.responses.map((r, i) => (
                        <Badge
                          key={i}
                          variant={r.hasError ? "destructive" : "secondary"}
                          className="text-xs px-1.5 py-0"
                        >
                          {r.provider.slice(0, 3)}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
