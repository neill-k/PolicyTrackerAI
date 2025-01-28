import { SearchService } from "./search-service";
import type { Policy, Source } from "../../db/schema";
import { WebScraper } from "./scraper";
import { Portkey } from "portkey-ai";
import { z } from "zod";

const AIConfigSchema = z.object({
  apiKey: z.string(),
  virtualKey: z.string(),
  model: z.string().default("gemini-2.0-flash-exp"),
  maxTokens: z.number().default(2000),
  braveApiKey: z.string(),
});

interface CrossReferenceResult {
  reliability: number;
  relevance: number;
  confidence: number;
  verifiedFacts: Array<{
    claim: string;
    confidence: number;
    supportingSources: string[];
  }>;
  suggestedUpdates: string[];
  metadata: {
    lastVerified: Date;
    verificationMethod: string;
    sourceCount: number;
  };
}

interface PortkeyResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class AIService {
  private config: z.infer<typeof AIConfigSchema>;
  private portkey: Portkey;
  private searchService: SearchService;

  constructor(config: z.infer<typeof AIConfigSchema>) {
    this.config = AIConfigSchema.parse(config);
    this.portkey = new Portkey({
      apiKey: this.config.apiKey,
      virtualKey: this.config.virtualKey,
    });
    this.searchService = new SearchService(this.config.braveApiKey);
  }

  async extractUniversityDomain(universityName: string): Promise<string> {
    const prompt = `Given the university name "${universityName}", provide ONLY the official website domain (e.g., "stanford.edu" or "mit.edu").
		Return ONLY the domain, nothing else.`;

    const response = (await this.portkey.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: this.config.model,
      maxTokens: 100,
    })) as PortkeyResponse;

    const domain = response.choices[0]?.message?.content.trim().toLowerCase();

    // Validate domain format
    if (!domain || !domain.includes(".")) {
      throw new Error("Failed to extract valid domain for university");
    }

    return domain;
  }

  async researchUniversity(
    universityName: string,
    website?: string
  ): Promise<{
    summary: string;
    policies: Array<Omit<Policy, "id" | "universityId">>;
    sources: Array<Omit<Source, "id" | "universityId" | "policyId">>;
  }> {
    // Get domain either from provided website or extract it
    const domain = website || (await this.extractUniversityDomain(universityName));

    // Search for university AI policies using the domain
    const searchResults = await this.searchService.searchUniversityAIPolicies(domain);

    const policies: Array<Omit<Policy, "id" | "universityId">> = [];
    const sources: Array<Omit<Source, "id" | "universityId" | "policyId">> = [];

    // Process each search result
    for (const result of searchResults) {
      const scraper = new WebScraper(result.url);
      try {
        const documents = await scraper.crawlPolicyPages();

        for (const doc of documents) {
          const analysis = await this.analyzePolicyDocument(doc.content);

          if (analysis) {
            policies.push({
              category: analysis.category,
              title: analysis.title,
              content: doc.content,
              status: analysis.status,
              implementationDate: null,
              lastUpdated: new Date(),
            });

            sources.push({
              url: doc.url,
              title: result.title,
              type: "webpage",
              retrievalDate: new Date(),
              content: doc.content,
              metadata: { 
              description: result.description || `Policy document from ${result.url}`
              },
            });
          }
        }
      } catch (error) {
        console.error(`Failed to process ${result.url}:`, error);
        continue;
      }
    }

    // Generate overall summary
    const summary = await this.generatePolicySummary(policies as Policy[]);

    return { summary, policies, sources };
  }

  async analyzePolicyDocument(content: string): Promise<{
    category: string;
    title: string;
    summary: string;
    status: string;
    metadata: Record<string, string | number | boolean | null>;
  }> {
    const prompt = `Analyze the following university policy document and extract key information:
		${content.substring(0, 3000)}
		
		Provide a structured analysis including:
		1. Category (e.g., teaching, research, governance)
		2. Title
		3. Summary
		4. Status (active/draft/archived)
		5. Any additional metadata`;

    const response = (await this.portkey.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: this.config.model,
      maxTokens: this.config.maxTokens,
    })) as PortkeyResponse;

    const analysis = response.choices[0]?.message?.content as string;
    const lines = analysis.split("\n");

    return {
      category:
        lines
          .find((l: string) => l.includes("Category"))
          ?.split(":")[1]
          ?.trim() || "unknown",
      title:
        lines
          .find((l: string) => l.includes("Title"))
          ?.split(":")[1]
          ?.trim() || "Untitled Policy",
      summary:
        lines
          .find((l: string) => l.includes("Summary"))
          ?.split(":")[1]
          ?.trim() || "",
      status:
        lines
          .find((l: string) => l.includes("Status"))
          ?.split(":")[1]
          ?.trim() || "unknown",
      metadata: {},
    };
  }

  async generatePolicySummary(policies: Policy[]): Promise<string> {
    const prompt = `Summarize the following university AI policies:
		${JSON.stringify(policies, null, 2)}
		
		Provide a comprehensive summary focusing on:
		1. Overall AI strategy
		2. Key policy areas
		3. Notable restrictions or guidelines
		4. Implementation timeline`;

    const response = (await this.portkey.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: this.config.model,
      maxTokens: this.config.maxTokens,
    })) as PortkeyResponse;

    return (response.choices[0]?.message?.content as string) || "";
  }

  async crossReferenceSource(source: Omit<Source, "id">): Promise<CrossReferenceResult> {
    const claimsPrompt = `Extract key claims about AI policies from this source:
		${source.content?.substring(0, 2000)}
		
		List each claim separately, focusing on:
		1. Policy statements
		2. Implementation details
		3. Restrictions and guidelines
		4. Dates and timelines`;

    const claimsResponse = (await this.portkey.chat.completions.create({
      messages: [{ role: "user", content: claimsPrompt }],
      model: this.config.model,
      maxTokens: this.config.maxTokens,
    })) as PortkeyResponse;

    const content = claimsResponse.choices[0]?.message?.content as string;
    const claims = content.split("\n").filter((claim: string) => claim.trim().length > 0);

    const verifiedFacts = await Promise.all(
      claims.map(async (claim: string) => {
        const verificationResult = await this.verifyFactAgainstSources(claim);
        return {
          claim,
          confidence: verificationResult.confidence,
          supportingSources: verificationResult.sources,
        };
      })
    );

    const confidence =
      verifiedFacts.reduce(
        (acc: number, fact: { confidence: number }) => acc + fact.confidence,
        0
      ) / verifiedFacts.length;

    return {
      reliability: this.calculateReliabilityScore(source, verifiedFacts),
      relevance: this.calculateRelevanceScore(verifiedFacts),
      confidence,
      verifiedFacts,
      suggestedUpdates: this.generateSuggestedUpdates(verifiedFacts),
      metadata: {
        lastVerified: new Date(),
        verificationMethod: "multi-source-validation",
        sourceCount: verifiedFacts.reduce(
          (acc: number, fact: { supportingSources: string[] }) =>
            acc + fact.supportingSources.length,
          0
        ),
      },
    };
  }

  private async verifyFactAgainstSources(
    claim: string
  ): Promise<{ confidence: number; sources: string[] }> {
    const verificationPrompt = `Verify this claim about university AI policy:
		"${claim}"
		
		Consider:
		1. Consistency with known policies
		2. Alignment with standard practices
		3. Credibility of supporting evidence
		
		Provide:
		1. Confidence score (0-1)
		2. List of supporting sources`;

    const response = (await this.portkey.chat.completions.create({
      messages: [{ role: "user", content: verificationPrompt }],
      model: this.config.model,
      maxTokens: this.config.maxTokens,
    })) as PortkeyResponse;

    const content = response.choices[0]?.message?.content as string;
    const lines = content.split("\n");

    return {
      confidence: parseFloat(
        lines.find((l: string) => l.includes("Confidence"))?.split(":")[1] || "0.5"
      ),
      sources: lines.filter((l: string) => l.includes("http")).map((l: string) => l.trim()),
    };
  }

  private calculateReliabilityScore(
    source: Omit<Source, "id">,
    verifiedFacts: Array<{ confidence: number }>
  ): number {
    const factConfidence =
      verifiedFacts.reduce((acc, fact) => acc + fact.confidence, 0) / verifiedFacts.length;
    const domainScore = this.calculateDomainReliability(source.url);
    return factConfidence * 0.7 + domainScore * 0.3;
  }

  private calculateRelevanceScore(verifiedFacts: Array<{ claim: string }>): number {
    // Use verifiedFacts to calculate a more accurate relevance score
    const totalClaims = verifiedFacts.length;
    if (totalClaims === 0) return 0.5;

    // Count claims that appear to be directly related to AI policies
    const aiRelatedClaims = verifiedFacts.filter(
      (fact) =>
        fact.claim.toLowerCase().includes("ai") ||
        fact.claim.toLowerCase().includes("artificial intelligence") ||
        fact.claim.toLowerCase().includes("policy")
    ).length;

    return Math.min(1, (aiRelatedClaims / totalClaims) * 1.2); // Scale up slightly but cap at 1
  }

  private calculateDomainReliability(url: string): number {
    // Simplified domain reliability calculation
    if (url.includes(".edu")) return 0.9;
    if (url.includes(".gov")) return 0.9;
    if (url.includes(".org")) return 0.7;
    return 0.5;
  }

  private generateSuggestedUpdates(
    verifiedFacts: Array<{ claim: string; confidence: number }>
  ): string[] {
    return verifiedFacts
      .filter((fact) => fact.confidence < 0.7)
      .map((fact) => `Verify claim: "${fact.claim}" with additional sources`);
  }
}
