import { OpenAIEmbeddings } from "@langchain/openai";
import 'dotenv/config'

export const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",

    configuration: {
        baseURL: "https://openrouter.ai/api/v1",

        apiKey: process.env.OPENROUTER_API_KEY,
    },
});