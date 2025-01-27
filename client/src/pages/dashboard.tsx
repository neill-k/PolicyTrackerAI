import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { UniversityCard } from "@/components/university-card";
import { SearchFilter } from "@/components/search-filter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  
  const { data: universities = [], isLoading } = useQuery({
    queryKey: ["/api/universities", search],
    queryFn: () => api.universities.list(search),
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">University AI Policies</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add University
        </Button>
      </div>

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {universities.map((university) => (
            <UniversityCard key={university.id} university={university} />
          ))}
        </div>
      )}
    </div>
  );
}
