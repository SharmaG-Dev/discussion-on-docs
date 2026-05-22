export enum QueuesNames {
  UPLOAD = "upload_file",
  READING = "read_file",
  CHUNKING = "chunking_file",
  VECTOR_STORE = "vector_store_file",
}

export interface JobS {
  [QueuesNames.UPLOAD]: {
    userId: string,
    id: string
    filePath: string
    previewPath?: string
    originalName?: string
    mimeType?: string
  }
  [QueuesNames.READING]: {
    userId: string,
    path: string
    id: string
  }
  [QueuesNames.CHUNKING]: {
    userId: string,
    text: string
    id: string
  }
  [QueuesNames.VECTOR_STORE]: {
    userId: string,
    id: string
    docs: Document[]
  }
}
