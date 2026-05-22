type Store = {
    files: { path: string, error?: string, isReady: boolean, uploadedAt: Date, id: string, file: File, status: 'Checking...' | 'Uploading...' | 'Reading...' | 'Chunking...' | 'Storing vectors...' | 'Ready' | 'Failed' }[]
}

const globalForStore = globalThis as typeof globalThis & {
    store?: Store
}

export const store =
    globalForStore.store ?? {
        files: [],
    }

if (process.env.NODE_ENV !== "production") {
    globalForStore.store = store
}