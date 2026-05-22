
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse.js";
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddings } from '../config/embeddings';
import fs from 'fs/promises';
import path from 'path';

import { ChromaClient } from "chromadb";

class UploadTools {
    private uploadDir = path.join(process.cwd(), "uploads");

    private sanitizeFileName(fileName: string) {
        return fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
    }

    async ensureUploadDir() {
        await fs.mkdir(this.uploadDir, { recursive: true });
    }

    async uploadFile(file: File) {
        await this.ensureUploadDir();

        const safeName = this.sanitizeFileName(file.name);
        const fileName = `${Date.now()}-${safeName}`;
        const filePath = path.join(this.uploadDir, fileName);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fs.writeFile(filePath, buffer);

        return {
            fileName,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            filePath,
            previewPath: `/uploads/${fileName}`,
        };
    }

    async deleteUploadFile(filePath: string) {
        if (!filePath) return false;

        const full = path.resolve(filePath);
        const uploadsRoot = path.resolve(this.uploadDir);

        // Safety: only allow deletes within ./uploads
        if (!full.toLowerCase().startsWith(uploadsRoot.toLowerCase() + path.sep)) {
            throw new Error(`Refusing to delete outside uploads dir: ${full}`);
        }

        try {
            await fs.unlink(full);
            return true;
        } catch (err: any) {
            if (err?.code === "ENOENT") return false;
            throw err;
        }
    }

    async getFilePreview(file: File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return {
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            isPdf: file.type === "application/pdf",
            textPreview: file.type.startsWith("text/")
                ? buffer.toString("utf-8").slice(0, 2000)
                : null,
        };
    }
    async parsePdf(url: string) {
        let buffer: Buffer

        if (/^https?:\/\//i.test(url)) {
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            buffer = Buffer.from(arrayBuffer)
        } else {
            // Local filesystem path written by uploadFile()
            buffer = await fs.readFile(url)
        }

        const data = await pdf(buffer)

        return data.text
    }

    async readTextAndStoreVector(text: string): Promise<any[]> {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50
        })
        const docs = await splitter.createDocuments([text])
        return docs
    }


    async vectorStore(docs: Document[], id: string) {
        console.log(id)
        const vectorStore = await Chroma.fromDocuments(docs as any, embeddings, {
            collectionName: id,
            url: "http://localhost:8000",
        });
        const oldSearch =
            vectorStore.similaritySearchVectorWithScore.bind(vectorStore);
        vectorStore.similaritySearchVectorWithScore = async function (
            query,
            k,
            filter,
        ) {
            return oldSearch(query, k, filter);
        };

        return vectorStore;
    }

    async emptyCromaDb(id: string) {
        const client = new ChromaClient({ host: "localhost", port: 8000 });
        try {
            await client.deleteCollection({ name: id });
            console.log(`Cleared existing collection ${id}`);
        } catch (e) {
            console.log(e);
        }
    }

}




export const uploadTools = new UploadTools()
