import axios from "axios";

interface BraveSearchResult {
  url: string;
  title: string;
  description: string;
}

interface BraveSearchResponse {
  web: {
    results: BraveSearchResult[];
  };
}

interface SearchResult {
  url: string;
  title: string;
  description: string;
}

export class SearchService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.search.brave.com/res/v1/web/search";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async performSearch(query: string, count: number = 30): Promise<SearchResult[]> {
    try {
      const response = await axios.get<BraveSearchResponse>(this.baseUrl, {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": this.apiKey,
        },
        params: {
          q: query,
          format: "json",
          count,
        },
      });

      return response.data.web.results.map((result) => ({
        url: result.url,
        title: result.title,
        description: result.description,
      }));
    } catch (error) {
      console.error("Search failed:", error);
      throw new Error("Failed to search for university AI policies");
    }
  }

  async searchUniversityAIPolicies(domain: string): Promise<SearchResult[]> {
    const searchQueries = [
      `site:${domain} artificial intelligence AI policy`,
      `site:${domain} AI guidelines`,
      `site:${domain} AI resources`,
    ];

    const allResults: SearchResult[] = [];

    for (const query of searchQueries) {
      const results = await this.performSearch(query);
      allResults.push(...results);
    }

    // Remove duplicates based on URL
    const uniqueResults = Array.from(new Map(allResults.map((item) => [item.url, item])).values());

    // Filter to ensure all results are from the university domain
    return uniqueResults.filter((result) => result.url.toLowerCase().includes(domain));
  }
}
