import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { TrendChart } from "@/components/analytics/trend-chart";
import { CategoryChart } from "@/components/analytics/category-chart";
import { GeographicChart } from "@/components/analytics/geographic-chart";
import {
  getPolicyTrendData,
  getCategoryDistribution,
  getGeographicDistribution,
} from "@/lib/analytics";

export default function Analytics() {
  const { data: universities = [] } = useQuery({
    queryKey: ["/api/universities"],
    queryFn: () => api.universities.list(),
  });

  const { data: policies = [] } = useQuery({
    queryKey: ["/api/policies"],
    queryFn: () => api.policies.list(),
  });

  const trendData = getPolicyTrendData(policies);
  const categoryData = getCategoryDistribution(policies);
  const geographicData = getGeographicDistribution(universities);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Analytics & Trends</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={trendData} />
        <CategoryChart data={categoryData} />
        <div className="lg:col-span-2">
          <GeographicChart data={geographicData} />
        </div>
      </div>
    </div>
  );
}
