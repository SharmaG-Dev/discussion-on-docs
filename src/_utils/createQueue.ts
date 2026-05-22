import { Queue } from "bullmq"

import { JobS, QueuesNames } from "@/types/queue"
import { connection } from "@/lib/redis"

export const createQueue = <T extends QueuesNames>(name: T) => {
    return new Queue<JobS[T]>(name, {
        connection
    })
}