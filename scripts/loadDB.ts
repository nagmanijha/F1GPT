import { DataAPIClient } from '@datastax/astra-db-ts';
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { pipeline } from '@xenova/transformers'; // Added transformers
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import "dotenv/config";

type SimilarityMetric = 'cosine' | 'euclidean' | 'dot_product';

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN } = process.env;

// Initialize embedding pipeline
let embedder: any = null;
const initializeEmbedder = async () => {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
};

const f1Data = [
  'https://en.wikipedia.org/wiki/Formula_One',
  'https://en.wikipedia.org/wiki/2023_Formula_One_season',
  'https://en.wikipedia.org/wiki/2023_Formula_One_World_Championship',
  'https://www.formula1.com/',
  'https://www.formula1.com/en/racing/2023.html',
  'https://www.bbc.com/sport/formula1',
  'https://www.formula1.com/en/racing/2023/Canada.html',
  'https://www.espn.in/f1/'
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);
const db = client.db(ASTRA_DB_API_ENDPOINT!, { namespace: ASTRA_DB_NAMESPACE! });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 108,
});

// Create collection with 384 dimensions (MiniLM vector size)
const createCollection = async (similarityMetric: SimilarityMetric = "cosine") => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION!, {
    vector: {
      dimension: 384, // Updated dimension
      metric: similarityMetric
    }
  });
  console.log(res);
};

// Generate embeddings using local model
const generateEmbedding = async (text: string): Promise<number[]> => {
  const extractor = await initializeEmbedder();
  const output = await extractor(text, { pooling: 'mean' });
  return Array.from(output.data);
};

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION!);
  for (const url of f1Data) {
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    for (const chunk of chunks) {
      const vector = await generateEmbedding(chunk); // Local embedding
      const res = await collection.insertOne({
        text: chunk,
        $vector: vector
      });
      console.log(res);
    }
  }
};

const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: { headless: true },
    gotoOptions: { waitUntil: 'domcontentloaded' },
    evaluate: async (page, browser) => {
      const content = await page.evaluate(() => document.body.innerText);
      await browser.close();
      return content;
    }
  });
  return (await loader.scrape())?.replace(/<[^>]*>?/gm, '');
};

// Initialize and run
createCollection().then(() => loadSampleData());