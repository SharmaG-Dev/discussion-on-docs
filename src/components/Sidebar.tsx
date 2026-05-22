"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { Upload, CheckCircle, FileText, X, Loader2 } from "lucide-react";
import { UploadRecord } from "@/lib/uploadsStatus";
import { useDeleteFileMutation } from "@/store/api/uploadApi";


interface SidebarProps {
  onFileUpload: (files: FileList) => void;
  uploadedFiles: UploadRecord[];
  isUploading: boolean;
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
}

export default function Sidebar({
  onFileUpload,
  uploadedFiles,
  isUploading,
  activeFileId,
  onSelectFile,
}: SidebarProps) {
  const [dragActive, setDragActive] = useState(false);
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation()
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
    }
  };

  const isUploaded = uploadedFiles.length > 0;

  return (
    <div className="w-full md:w-80 h-full bg-background/80 backdrop-blur-md border-l border-border p-6 flex flex-col justify-between transition-colors duration-200 overflow-y-auto">
      <div>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-foreground">Settings</h2>
          <ThemeToggle />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-text mb-2">
            Upload Documents
          </label>
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragActive
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary"
              } ${isUploading ? "opacity-75 cursor-not-allowed" : ""}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && document.getElementById("file-upload")?.click()}
          >
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.txt"
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin-smooth mb-2" />
                <p className="text-sm font-medium text-text">Uploading...</p>
              </div>
            ) : isUploaded ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="h-10 w-10 text-success mb-2" />
                <p className="text-sm font-medium text-success">Files Uploaded!</p>
                <p className="text-xs text-secondary-foreground mt-1">Click to add more</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-10 w-10 text-secondary-foreground mb-2" />
                <p className="text-sm text-text">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-secondary-foreground mt-1">
                  PDF, DOCX, TXT (Single or Multiple)
                </p>
              </div>
            )}
          </div>
        </div>

        {isUploaded && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-text mb-2">Uploaded Files</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto animate-fade-in">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  onClick={() => file.isReady && onSelectFile(file.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                    file.isReady
                      ? "cursor-pointer hover:bg-secondary/60"
                      : "opacity-80"
                  } ${
                    file.id === activeFileId
                      ? "bg-primary/10 border border-primary/40 shadow-sm ring-1 ring-primary/20"
                      : "bg-secondary border border-border/50"
                  }`}
                >
                  <div className="flex items-center space-x-2 overflow-hidden flex-1">
                    <FileText className={`h-5 w-5 ${file.id === activeFileId ? "text-primary" : "text-secondary-foreground"}`} />
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium truncate ${file.id === activeFileId ? "text-primary" : "text-text"}`} title={file.originalName}>
                        {file.originalName}
                      </div>
                      <div className="text-xs text-secondary-foreground truncate">
                        {file.status !== "Failed" ? file.status : `${file.status}: ${file.error}`}
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-secondary-foreground hover:text-destructive transition-colors ml-2 p-1 rounded-md hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-secondary-foreground text-center mt-4">
        Powered by SharmaG-Dev
      </div>
    </div>
  );
}
