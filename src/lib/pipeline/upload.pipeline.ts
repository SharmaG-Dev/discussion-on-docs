import { Job } from "bullmq";
import { FileStatus, markUploadFailed, markUploadReady, patchUploadRecord, setUploadStatus } from "../uploadsStatus";
import { uploadTools } from "../tools/uploads.tools";
import { JobS } from "@/types/queue";




class UploadPipeline {

    async setFileStatus(id: string, status: FileStatus, error?: string) {
        await setUploadStatus(id, status, error)
    }
    async uploadFile(job: Job) {
        const { filePath, id, previewPath, userId } = job.data as JobS['upload_file']
        if (!id) throw new Error("Missing upload id")
        if (!filePath) {
            await markUploadFailed(id, "Missing filePath in upload job")
            throw new Error("Missing filePath in upload job")
        }

        if (previewPath) {
            await patchUploadRecord(id, { previewPath })
        }

        await this.readingFile({ path: filePath, id, userId })
    }


    async readingFile(data: JobS['read_file']) {
        const { path, id, userId } = data
        await this.setFileStatus(id, "Reading...")

        const text = await uploadTools.parsePdf(path)

        console.log('passed -reading')
        await this.chunkingFile({
            text,
            id,
            userId
        })
    }
    async chunkingFile(data: JobS['chunking_file']) {
        const { text, id, userId } = data
        await this.setFileStatus(id, "Chunking...")

        const embeddings = await uploadTools.readTextAndStoreVector(text)

        console.log('passed -Chunking')
        await this.vectorStoreFile({
            id,
            docs: embeddings,
            userId
        })
    }
    async vectorStoreFile(data: JobS['vector_store_file']) {
        const { docs, id, userId } = data
        await this.setFileStatus(id, "Storing vectors...")

        const result = await uploadTools.vectorStore(docs, userId)
        console.log('passed -vector store')
        if (!result) {
            await markUploadFailed(id, "Vector store failed")
            throw new Error(`Vector store failed for file ${userId}`)
        }

        await markUploadReady(id)
    }
}


export const uploadPipeline = new UploadPipeline()

