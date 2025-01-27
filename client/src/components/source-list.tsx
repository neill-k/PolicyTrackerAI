import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Source } from "@db/schema";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface SourceListProps {
  sources: Source[];
}

export function SourceList({ sources }: SourceListProps) {
  return (
    <div className="space-y-4">
      {sources.map((source) => (
        <Card key={source.id}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{source.title}</span>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Retrieved on {format(new Date(source.retrievalDate), "PP")}
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{source.type}</Badge>
            {source.content && (
              <p className="mt-2 text-sm text-muted-foreground">{source.content}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
