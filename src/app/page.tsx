"use client";

import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import { useGetUploadsQuery, useUploadFileMutation } from "@/store/api/uploadApi";
import type { UploadRecord } from "@/lib/uploadsStatus";
import { useAuth } from "@/providers/useAuth";
import { useEffect, useState } from "react";

export default function Home() {
  const auth = useAuth();
  const init = auth?.init;
  const user = auth?.user;

  console.log(auth?.user)
  const { data } = useGetUploadsQuery(undefined, {
    pollingInterval: 3000,
  });
  const uploadedFiles: UploadRecord[] = (data ?? []) as UploadRecord[];
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  // Auto-select first ready file
  const readyFiles = uploadedFiles.filter((f) => f.isReady);
  useEffect(() => {
    if (readyFiles.length > 0) {
      if (!activeFileId || !readyFiles.some((f) => f.id === activeFileId)) {
        setActiveFileId(readyFiles[0].id);
      }
    } else {
      setActiveFileId(null);
    }
  }, [readyFiles, activeFileId]);

  const activeFile = uploadedFiles.find((f) => f.id === activeFileId);
  const isUploaded = uploadedFiles.length > 0;

  const handleFileUpload = async (files: FileList) => {
    const newFiles = Array.from(files);

    for (const file of newFiles) {
      try {
        await uploadFile({ userId: user?.id || "unknown-user", file }).unwrap();
      } catch (error) {
        console.error("Upload failed for file:", file.name, error);
      }
    }
  };

  useEffect(() => {
    if (init) {
      init()
    }
  }, [])

  return (
    <main className="flex flex-col md:flex-row h-screen overflow-hidden">
      <div className="flex-1 h-[70vh] md:h-full order-2 md:order-1">
        <ChatArea isUploaded={isUploaded} activeFile={activeFile} />
      </div>
      <div className="w-full md:w-80 h-[30vh] md:h-full order-1 md:order-2 border-b md:border-b-0 md:border-l border-gray-200 dark:border-gray-700">
        <Sidebar
          onFileUpload={handleFileUpload}
          uploadedFiles={uploadedFiles}
          isUploading={isUploading}
          activeFileId={activeFileId}
          onSelectFile={setActiveFileId}
        />
      </div>
    </main>
  );
}
