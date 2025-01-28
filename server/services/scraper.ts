import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedDocument {
  url: string;
  title: string;
  content: string;
  links: string[];
  metadata: {
    lastModified?: string;
    author?: string;
    type?: string;
  };
}

export class WebScraper {
  private readonly baseUrl: string;
  private visitedUrls: Set<string> = new Set();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async scrapeUrl(url: string): Promise<ScrapedDocument> {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Extract content
      const content = $("body").text().trim();
      const title = $("title").text().trim() || $("h1").first().text().trim();

      // Extract links
      const links = new Set<string>();
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (href && href.startsWith(this.baseUrl)) {
          links.add(href);
        }
      });

      // Extract metadata
      const metadata = {
        lastModified: $('meta[name="last-modified"]').attr("content"),
        author: $('meta[name="author"]').attr("content"),
        type: this.inferDocumentType($, url),
      };

      return {
        url,
        title,
        content,
        links: Array.from(links),
        metadata,
      };
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
      throw error;
    }
  }

  private inferDocumentType($: cheerio.CheerioAPI, url: string): string {
    // Infer document type based on URL and content patterns
    if (url.includes("policy") || url.includes("policies")) return "policy";
    if (url.includes("news") || url.includes("press")) return "news";
    if (url.includes("about")) return "about";
    return "unknown";
  }

  async crawlPolicyPages(maxPages: number = 10): Promise<ScrapedDocument[]> {
    const documents: ScrapedDocument[] = [];
    const queue = [this.baseUrl];

    while (queue.length > 0 && documents.length < maxPages) {
      const url = queue.shift()!;
      if (this.visitedUrls.has(url)) continue;

      try {
        const doc = await this.scrapeUrl(url);
        this.visitedUrls.add(url);
        documents.push(doc);

        // Add new policy-related links to queue
        doc.links
          .filter((link) => !this.visitedUrls.has(link) && this.isPolicyRelated(link))
          .forEach((link) => queue.push(link));
      } catch (error) {
        console.error(`Failed to crawl ${url}:`, error);
      }
    }

    return documents;
  }

  private isPolicyRelated(url: string): boolean {
    const policyKeywords = [
      "policy",
      "policies",
      "guidelines",
      "rules",
      "ai",
      "artificial-intelligence",
    ];
    return policyKeywords.some((keyword) => url.toLowerCase().includes(keyword));
  }
}
