import type { Policy, University } from "@/types";

export function getPolicyTrendData(policies: Policy[]) {
  const timeline = policies.reduce(
    (acc, policy) => {
      let year: number | null = null;

      if (policy.implementationDate) {
        year = new Date(policy.implementationDate).getFullYear();
      } else if (policy.lastUpdated) {
        year = new Date(policy.lastUpdated).getFullYear();
      }

      if (year !== null) {
        acc[year] = (acc[year] || 0) + 1;
      }

      return acc;
    },
    {} as Record<number, number>
  );

  return Object.entries(timeline)
    .map(([year, count]) => ({
      year: parseInt(year),
      count,
    }))
    .sort((a, b) => a.year - b.year);
}

export function getCategoryDistribution(policies: Policy[]) {
  const distribution = policies.reduce(
    (acc, policy) => {
      acc[policy.category] = (acc[policy.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(distribution)
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getGeographicDistribution(universities: University[]) {
  const distribution = universities.reduce(
    (acc, university) => {
      acc[university.country] = (acc[university.country] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(distribution)
    .map(([country, count]) => ({
      country,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
