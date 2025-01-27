import { type Policy, type University } from "@db/schema";

export function getPolicyTrendData(policies: Policy[]) {
  const timeline = policies.reduce((acc, policy) => {
    const date = policy.implementationDate 
      ? new Date(policy.implementationDate).getFullYear()
      : new Date(policy.lastUpdated).getFullYear();
    
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return Object.entries(timeline)
    .map(([year, count]) => ({
      year: parseInt(year),
      count,
    }))
    .sort((a, b) => a.year - b.year);
}

export function getCategoryDistribution(policies: Policy[]) {
  const distribution = policies.reduce((acc, policy) => {
    acc[policy.category] = (acc[policy.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(distribution)
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getGeographicDistribution(universities: University[]) {
  const distribution = universities.reduce((acc, university) => {
    acc[university.country] = (acc[university.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(distribution)
    .map(([country, count]) => ({
      country,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}
