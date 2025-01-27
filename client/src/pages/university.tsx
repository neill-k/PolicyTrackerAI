import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { api } from "@/lib/api";
import { PolicyTable } from "@/components/policy-table";
import { SourceList } from "@/components/source-list";
import { SearchFilter } from "@/components/search-filter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function University() {
  const [, params] = useRoute("/university/:id");
  const [category, setCategory] = useState("");

  const { data: university, isLoading } = useQuery({
    queryKey: [`/api/universities/${params?.id}`],
    queryFn: () => api.universities.get(parseInt(params?.id || "0")),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!university) {
    return <div>University not found</div>;
  }

  const filteredPolicies = category
    ? university.policies.filter((p) => p.category === category)
    : university.policies;

  return (
    <div className="container mx-auto py-8">
      <Link href="/">
        <Button variant="ghost" className="mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{university.name}</h1>
          <p className="text-muted-foreground mt-2">{university.country}</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Policy
        </Button>
      </div>

      <Tabs defaultValue="policies">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          <SearchFilter
            search=""
            onSearchChange={() => {}}
            category={category}
            onCategoryChange={setCategory}
          />
          <PolicyTable policies={filteredPolicies} />
        </TabsContent>

        <TabsContent value="sources">
          <SourceList sources={university.sources} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
