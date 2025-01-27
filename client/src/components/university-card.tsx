import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type University } from "@db/schema";
import { Link } from "wouter";

interface UniversityCardProps {
  university: University & { policies?: { category: string }[] };
}

export function UniversityCard({ university }: UniversityCardProps) {
  const policyCategories = [...new Set(university.policies?.map(p => p.category) || [])];

  return (
    <Link href={`/university/${university.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="text-lg">{university.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{university.country}</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {policyCategories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
          {university.summary && (
            <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
              {university.summary}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
