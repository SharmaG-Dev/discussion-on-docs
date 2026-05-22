import { Worker } from "bullmq"
import { connection } from "../redis"
import { JobS, QueuesNames } from "@/types/queue"
import {
    markUploadFailed,
} from "../uploadsStatus"
import { uploadPipeline } from "../pipeline/upload.pipeline"


const registerWorkerEvents = (worker: Worker, queueName: string) => {
    worker.on("completed", (job) => {
        console.log(`[${queueName}] Job ${job.id} completed`)
    })

    worker.on("failed", (job, err) => {
        const id = job?.data?.id
        if (id) {
            void markUploadFailed(id, err.message)
        }
    })

    worker.on("error", (err) => {
        console.error(`[${queueName}] Worker error: ${err.message}`)
    })
}

const uploadWorker = new Worker<JobS[QueuesNames.UPLOAD]>(
    QueuesNames.UPLOAD,
    uploadPipeline.uploadFile.bind(uploadPipeline),
    {
        connection,
    }
)



registerWorkerEvents(uploadWorker, QueuesNames.UPLOAD)
