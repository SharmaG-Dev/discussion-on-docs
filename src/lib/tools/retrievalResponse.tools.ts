import { Chroma } from "@langchain/community/vectorstores/chroma"
import { embeddings } from "../config/embeddings"
import { llm } from "../config/llm"



class RetrievalResponseTools {

    async retrieveFromDocs(query: string, collecitonId: string) {
        const vectorStore = new Chroma(embeddings, {
            collectionName: collecitonId,
            url: "http://localhost:8000",
        })

        const retriever = vectorStore.asRetriever({
            k: 3,
        })

        const doc = retriever.invoke(query)
        return doc
    }


    async askQuestion(question: string, collectionId: string) {
        const docs = await this.retrieveFromDocs(question, collectionId)

        const context = docs.map(doc => doc.pageContent).join("\n\n");

        const prompt = `
You are a helpful AI assistant.

Note:If any Context then Reply on the basis of context and if the question is normal reply him noramally assitant

Context:
${context}

Question:
${question}
`;

        const response = await llm.invoke(prompt);

        return {
            answer: response,
            docs: docs
        }

    }


}


export const retrievalResponseTools = new RetrievalResponseTools()