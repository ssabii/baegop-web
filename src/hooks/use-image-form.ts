"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { compressImage } from "@/lib/image";

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface UseImageFormOptions {
  initialImageUrls?: string[];
  maxImages: number;
  maxFileSize?: number;
}

export interface UseImageFormResult {
  keptImageUrls: string[];
  selectedFiles: File[];
  previews: string[];
  compressingCount: number;
  totalImageCount: number;
  allImages: string[];
  hasImageChanges: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  removeExistingImage: (url: string) => void;
  removeNewFile: (index: number) => void;
  openFilePicker: () => void;
}

export function useImageForm({
  initialImageUrls = [],
  maxImages,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
}: UseImageFormOptions): UseImageFormResult {
  const [keptImageUrls, setKeptImageUrls] =
    useState<string[]>(initialImageUrls);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [compressingCount, setCompressingCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef(previews);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const totalImageCount = keptImageUrls.length + selectedFiles.length;
  const allImages = [...keptImageUrls, ...previews];
  const hasImageChanges =
    keptImageUrls.length !== initialImageUrls.length || selectedFiles.length > 0;

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const valid = files.filter((f) => f.size <= maxFileSize);
    if (valid.length < files.length) {
      toast.warning("10MB를 초과하는 이미지는 제외되었습니다.");
    }

    const remaining = maxImages - totalImageCount;
    const allowed = valid.slice(0, remaining);
    if (allowed.length < valid.length) {
      toast.warning(`이미지는 최대 ${maxImages}장까지 등록할 수 있습니다.`);
    }

    if (allowed.length > 0) {
      setCompressingCount(allowed.length);
      const compressed = await Promise.all(
        allowed.map(async (file) => {
          const result = await compressImage(file);
          setCompressingCount((prev) => prev - 1);
          return result;
        }),
      );
      setSelectedFiles((prev) => [...prev, ...compressed]);
      setPreviews((prev) => [
        ...prev,
        ...compressed.map((f) => URL.createObjectURL(f)),
      ]);
    }

    e.target.value = "";
  }

  function removeExistingImage(url: string) {
    setKeptImageUrls((prev) => prev.filter((u) => u !== url));
  }

  function removeNewFile(index: number) {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  return {
    keptImageUrls,
    selectedFiles,
    previews,
    compressingCount,
    totalImageCount,
    allImages,
    hasImageChanges,
    fileInputRef,
    handleFilesChange,
    removeExistingImage,
    removeNewFile,
    openFilePicker,
  };
}
