import { type University, type Policy, type Source } from "@db/schema";
import { queryClient } from "./queryClient";

export const api = {
  universities: {
    list: async (search?: string) => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      return queryClient.fetchQuery({
        queryKey: [`/api/universities?${params.toString()}`],
      }) as Promise<University[]>;
    },
    get: async (id: number) => {
      return queryClient.fetchQuery({
        queryKey: [`/api/universities/${id}`],
      }) as Promise<University & { policies: Policy[]; sources: Source[] }>;
    },
    create: async (data: Omit<University, "id" | "lastUpdated">) => {
      const response = await fetch("/api/universities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create university");
      return response.json();
    }
  },
  policies: {
    list: async (universityId?: number, category?: string) => {
      const params = new URLSearchParams();
      if (universityId) params.append("universityId", universityId.toString());
      if (category) params.append("category", category);
      return queryClient.fetchQuery({
        queryKey: [`/api/policies?${params.toString()}`],
      }) as Promise<Policy[]>;
    },
    create: async (data: Omit<Policy, "id" | "lastUpdated">) => {
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create policy");
      return response.json();
    }
  },
  sources: {
    list: async (universityId?: number, policyId?: number) => {
      const params = new URLSearchParams();
      if (universityId) params.append("universityId", universityId.toString());
      if (policyId) params.append("policyId", policyId.toString());
      return queryClient.fetchQuery({
        queryKey: [`/api/sources?${params.toString()}`],
      }) as Promise<Source[]>;
    },
    create: async (data: Omit<Source, "id" | "retrievalDate">) => {
      const response = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create source");
      return response.json();
    }
  }
};
