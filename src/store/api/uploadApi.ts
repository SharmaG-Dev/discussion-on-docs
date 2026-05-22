import { baseApi } from "./baseApi"

export type UploadRecord = {
  id: string
  originalName: string
  mimeType: string
  status: string
  isReady: boolean
  uploadedAt: string
  previewPath?: string
  filePath?: string
}

type GetUploadsResponse = {
  status: boolean
  uploads: UploadRecord[]
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUploads: build.query<UploadRecord[], void>({
      query: () => ({ url: "/api/upload", method: "GET" }),
      transformResponse: (resp: GetUploadsResponse) => resp.uploads || [],
      providesTags: (result) =>
        result
          ? [
            ...result.map((u) => ({ type: "Uploads" as const, id: u.id })),
            { type: "Uploads" as const, id: "LIST" },
          ]
          : [{ type: "Uploads" as const, id: "LIST" }],
    }),
    uploadFile: build.mutation<{ success: boolean; id?: string }, { file: File, userId: string }>({
      query: ({ file, userId }) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("userId", userId)
        return {
          url: "/api/upload",
          method: "POST",
          body: formData,
        }
      },
      invalidatesTags: [{ type: "Uploads", id: "LIST" }],
    }),
    deleteFile: build.mutation<{ success: boolean; id?: string }, string>({
      query: (id) => ({
        url: "/api/upload/remove",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: [{ type: "Uploads", id: "LIST" }],
    })
  }),
})

export const { useGetUploadsQuery, useUploadFileMutation, useDeleteFileMutation } = uploadApi
