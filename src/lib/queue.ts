
import { QueuesNames } from "@/types/queue";
import { createQueue } from "@/_utils/createQueue";



export const uploadQueue = createQueue(QueuesNames.UPLOAD)

