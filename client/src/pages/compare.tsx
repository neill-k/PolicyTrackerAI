import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PolicyTable } from "@/components/policy-table";

export default function Compare() {
  const [university1Id, setUniversity1Id] = useState<string>();
  const [university2Id, setUniversity2Id] = useState<string>();

  const { data: universities = [] } = useQuery({
    queryKey: ["/api/universities"],
    queryFn: () => api.universities.list(),
  });

  const { data: university1 } = useQuery({
    queryKey: [`/api/universities/${university1Id}`],
    queryFn: () => api.universities.get(parseInt(university1Id || "0")),
    enabled: !!university1Id,
  });

  const { data: university2 } = useQuery({
    queryKey: [`/api/universities/${university2Id}`],
    queryFn: () => api.universities.get(parseInt(university2Id || "0")),
    enabled: !!university2Id,
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Compare Universities</h1>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <Select value={university1Id} onValueChange={setUniversity1Id}>
            <SelectTrigger>
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent>
              {universities.map((uni) => (
                <SelectItem key={uni.id} value={uni.id.toString()}>
                  {uni.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {university1 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{university1.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <PolicyTable policies={university1.policies} />
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Select value={university2Id} onValueChange={setUniversity2Id}>
            <SelectTrigger>
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent>
              {universities.map((uni) => (
                <SelectItem key={uni.id} value={uni.id.toString()}>
                  {uni.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {university2 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>{university2.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <PolicyTable policies={university2.policies} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
