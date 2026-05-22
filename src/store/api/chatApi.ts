import { baseApi } from "./baseApi"

export type ChatRequest = {
  question: string
  userId: string
}

export type ChatResponse = {
  success: boolean
  answer: string
  docs?: any[]
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    askQuestion: build.mutation<ChatResponse, ChatRequest>({
      query: (body) => ({
        url: "/api/chat",
        method: "POST",
        body,
      }),
    }),
  }),
})

export const { useAskQuestionMutation } = chatApi
