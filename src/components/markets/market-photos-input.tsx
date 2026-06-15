"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MarketPhotosInputProps {
  photoUrls: string[];
  onPhotoUrlsChange: (urls: string[]) => void;
  pendingFiles: File[];
  onPendingFilesChange: (files: File[]) => void;
}

function filePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function MarketPhotosInput({
  photoUrls,
  onPhotoUrlsChange,
  pendingFiles,
  onPendingFilesChange,
}: MarketPhotosInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleFilesSelected(files: FileList | null) {
    if (!files?.length) return;

    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== files.length) {
      setUploadError("Only image files are supported.");
    } else {
      setUploadError(null);
    }

    onPendingFilesChange([...pendingFiles, ...validFiles]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removePendingFile(index: number) {
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index));
  }

  function removePhotoUrl(index: number) {
    onPhotoUrlsChange(photoUrls.filter((_, i) => i !== index));
  }

  function addUrlsFromTextarea() {
    const urls = urlInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (urls.length === 0) return;

    onPhotoUrlsChange([...photoUrls, ...urls]);
    setUrlInput("");
    setUploadError(null);
  }

  const totalCount = photoUrls.length + pendingFiles.length;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Market photos</Label>
        <p className="text-sm text-stone-500">
          Add photos of the venue, past events, or booth layout. Upload files or
          paste public image URLs.
        </p>
      </div>

      {totalCount > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photoUrls.map((url, index) => (
            <div
              key={`url-${url}-${index}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhotoUrl(index)}
                className="absolute right-2 top-2 rounded-full bg-stone-900/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {pendingFiles.map((file, index) => (
            <div
              key={`file-${file.name}-${index}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-stone-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={filePreviewUrl(file)}
                alt={file.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePendingFile(index)}
                className="absolute right-2 top-2 rounded-full bg-stone-900/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => handleFilesSelected(event.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          Upload photos
        </Button>
        <span className="self-center text-sm text-stone-500">
          {totalCount === 0
            ? "No photos added yet"
            : `${totalCount} photo${totalCount === 1 ? "" : "s"} selected`}
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photoUrls">Or paste image URLs</Label>
        <Textarea
          id="photoUrls"
          rows={3}
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          placeholder="https://example.com/photo.jpg"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addUrlsFromTextarea}
          disabled={!urlInput.trim()}
        >
          Add URLs
        </Button>
      </div>

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
    </div>
  );
}
