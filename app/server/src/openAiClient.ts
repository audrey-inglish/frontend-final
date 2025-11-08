import OpenAI from "openai";

export function getOpenAIClient() {
  return new OpenAI({
    apiKey: "dummy-key", 
    baseURL: "http://ai-snow.reindeer-pinecone.ts.net:9292/v1"
  });
}