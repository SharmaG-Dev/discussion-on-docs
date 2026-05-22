"use client"

import { Provider } from "react-redux"
import { makeStore } from "@/store/store"
import { useRef } from "react"
import { AuthProvider } from "@/providers/useAuth"

export default function Providers({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null)
  if (!storeRef.current) storeRef.current = makeStore()

  return <Provider store={storeRef.current}>
    <AuthProvider>{children}</AuthProvider></Provider>
}

