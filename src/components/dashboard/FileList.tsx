"use client";

import { useRef } from "react";
import { File, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { ProjectFile } from "@/lib/types";

function formatSize(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function FileList({ projectId, files }: { projectId: string; files: ProjectFile[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useAppStore((s) => s.uploadFile);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    Array.from(fileList).forEach((file) => {
      uploadFile(projectId, file.name, Math.max(1, Math.round(file.size / 1024)));
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          id="file-upload-input"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload file
        </Button>
      </div>

      {files.length === 0 ? (
        <EmptyState icon={File} title="No files yet" description="Files shared for this project will show up here." />
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-white">
          {files.map((file) => (
            <li key={file.id} className="flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                <File className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                <p className="text-xs text-ink-secondary">
                  {formatSize(file.sizeKb)} · {file.uploadedBy} · {formatDate(file.uploadedAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
