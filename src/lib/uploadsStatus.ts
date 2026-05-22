import { connection } from "./redis"

export type FileStatus =
  | "Checking..."
  | "Uploading..."
  | "Reading..."
  | "Chunking..."
  | "Storing vectors..."
  | "Ready"
  | "Failed"

export type UploadRecord = {
  userId: string
  id: string
  originalName: string
  mimeType: string
  status: FileStatus
  isReady: boolean
  uploadedAt: string
  error?: string;
  previewPath?: string
  filePath?: string
}

const indexKey = "uploads:index"
const recordKey = (id: string) => `uploads:file:${id}`

export async function initUploadRecord(input: {
  userId: string
  id: string
  originalName: string
  mimeType: string
}) {
  const now = new Date().toISOString()
  const rec: UploadRecord = {
    userId: input.userId,
    id: input.id,
    originalName: input.originalName,
    mimeType: input.mimeType,
    status: "Checking...",
    isReady: false,
    uploadedAt: now,
  }

  await connection
    .multi()
    .hset(recordKey(input.id), rec as any)
    .zadd(indexKey, Date.now(), input.id)
    .exec()

  return rec
}

export async function patchUploadRecord(id: string, patch: Partial<UploadRecord>) {
  if (!patch || Object.keys(patch).length === 0) return
  await connection.hset(recordKey(id), patch as any)

}

export async function setUploadStatus(id: string, status: FileStatus, error?: string) {
  await patchUploadRecord(id, { status })
  if (status === "Failed") await patchUploadRecord(id, { error })
}


export async function markUploadReady(id: string) {
  await patchUploadRecord(id, {
    status: "Ready",
    isReady: true,
    uploadedAt: new Date().toISOString(),
  })
}

export async function markUploadFailed(id: string, error: string) {
  await patchUploadRecord(id, { status: "Failed", isReady: false, error })
}

export async function getAllUploads(limit = 100): Promise<UploadRecord[]> {
  const ids = await connection.zrevrange(indexKey, 0, Math.max(0, limit - 1))
  if (ids.length === 0) return []

  const pipeline = connection.pipeline()
  for (const id of ids) pipeline.hgetall(recordKey(id))
  const res = await pipeline.exec()

  return (res || [])
    .map(([, v]) => v as any)
    .filter((v) => v && v.id)
    .map((v) => {
      const isReady =
        typeof v.isReady === "boolean"
          ? v.isReady
          : v.isReady === "true" || v.isReady === "1"

      return {
        ...v,
        isReady,
      } as UploadRecord
    })
}


export async function getSingleUpload(
  id: string
): Promise<UploadRecord | null> {
  const res = await connection.hgetall(recordKey(id))

  if (!res || !res.id) {
    return null
  }
  return {
    ...(res as any),
  } as UploadRecord
}


export async function deleteSingleUpload(id: string) {
  await connection
    .multi()
    .del(recordKey(id))
    .zrem(indexKey, id)
    .exec()
}

export async function deleteAllUploads() {

  const ids = await connection.zrange(indexKey, 0, -1)

  if (ids.length === 0) {
    return
  }

  const keys = ids.map((id) => recordKey(id))

  await connection
    .multi()
    .del(...keys)
    .del(indexKey)
    .exec()
}