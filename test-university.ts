import { AIService } from "./server/services/ai-service";
import type { Policy, Source, SourceMetadata } from "./db/schema";
import "dotenv/config";

interface ResearchResult {
  summary: string;
  policies: Array<Omit<Policy, "id" | "universityId">>;
  sources: Array<Omit<Source, "id" | "universityId" | "policyId"> & { 
    metadata: SourceMetadata 
  }>;
}



async function testUniversity() {
  const aiService = new AIService({
    apiKey: process.env.PORTKEY_API_KEY || "",
    virtualKey: process.env.PORTKEY_VIRTUAL_KEY || "",
    braveApiKey: process.env.BRAVE_API_KEY || "",
    model: "gemini-2.0-flash-exp",
    maxTokens: 2000,
  });

  async function printResults(result: ResearchResult, testCase: string) {
    console.log(`\n=== ${testCase} ===`);
    console.log("Summary:", result.summary);
    console.log("\nPolicies Found:", result.policies.length);
    result.policies.forEach((policy, index) => {
      console.log(`\nPolicy ${index + 1}:`);
      console.log("Title:", policy.title);
      console.log("Category:", policy.category);
      console.log("Status:", policy.status);
    });

    console.log("\nSources:", result.sources.length);
    result.sources.forEach((source, index) => {
      console.log(`\nSource ${index + 1}:`);
      console.log("URL:", source.url);
      console.log("Type:", source.type);
      console.log("Description:", source.metadata.description);
    });
  }

  try {
    // Test with provided website
    const resultWithWebsite = await aiService.researchUniversity(
      "Stanford University",
      "stanford.edu"
    );
    await printResults(resultWithWebsite, "Test with provided website");

    // Test with domain extraction
    const resultWithExtraction = await aiService.researchUniversity("MIT");
    await printResults(resultWithExtraction, "Test with domain extraction");
  } catch (error) {
    console.error("Error analyzing university:", error);
  }
}

testUniversity().catch(console.error);
