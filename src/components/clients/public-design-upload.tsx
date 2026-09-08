"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ImageIcon,
  ImagePlus,
  Link2,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { uploadDesignImage, updateOrderItemDesign, resolveAssetUrl } from "@/lib/api/public";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PublicDesignUploadProps {
  orderId: string;
  itemId: string;
  garmentType: string;
  readOnly?: boolean;
  initialImageUrl?: string | null;
  initialReferenceUrl?: string | null;
  onUpdated?: (itemId: string, data: { designImageUrl: string | null; designReferenceUrl: string | null }) => void;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function PublicDesignUpload({
  orderId,
  itemId,
  garmentType,
  readOnly,
  initialImageUrl,
  initialReferenceUrl,
  onUpdated,
}: PublicDesignUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(() =>
    initialImageUrl ? resolveAssetUrl(initialImageUrl) : null
  );
  const [referenceUrl, setReferenceUrl] = useState<string>(initialReferenceUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(!!initialReferenceUrl);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      if (file.size > MAX_SIZE_BYTES) {
        setError("Image too large. Please upload an image up to 3-5 MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file.");
        return;
      }

      setError(null);
      setUploading(true);
      try {
        const { url } = await uploadDesignImage(file);
        setImageUrl(url);
        await updateOrderItemDesign(orderId, itemId, { designImageUrl: url });
        onUpdated?.(itemId, { designImageUrl: url, designReferenceUrl: referenceUrl || null });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [orderId, itemId, referenceUrl, onUpdated]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
      e.target.value = "";
    },
    [handleUpload]
  );

  const handleSaveReference = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const url = referenceUrl.trim() || null;
      await updateOrderItemDesign(orderId, itemId, { designReferenceUrl: url });
      onUpdated?.(itemId, { designImageUrl: imageUrl, designReferenceUrl: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [orderId, itemId, referenceUrl, imageUrl, onUpdated]);

  const handleRemoveImage = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await updateOrderItemDesign(orderId, itemId, { designImageUrl: null });
      setImageUrl(null);
      onUpdated?.(itemId, { designImageUrl: null, designReferenceUrl: referenceUrl || null });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setSaving(false);
    }
  }, [orderId, itemId, referenceUrl, onUpdated]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  // ── Header shared by read-only and editable views ───────────────────────────
  const header = (
    <div className="mb-2.5 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <ImageIcon className="size-4" />
        </div>
        <div>
          <p className="text-sm leading-tight font-medium">{garmentType}</p>
          <p className="text-[11px] leading-tight text-muted-foreground">Design photo</p>
        </div>
      </div>
      {!readOnly && imageUrl && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleRemoveImage}
          disabled={saving}
          aria-label="Remove image"
          className="text-muted-foreground hover:text-destructive"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
        </Button>
      )}
    </div>
  );

  // ── Reference link row ──────────────────────────────────────────────────────
  const referenceRow = readOnly ? (
    referenceUrl ? (
      <a
        href={referenceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 inline-flex w-full items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-primary transition-colors hover:bg-muted/70 hover:underline"
      >
        <Link2 className="size-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{referenceUrl}</span>
        <ExternalLink className="size-3.5 shrink-0" />
      </a>
    ) : null
  ) : (
    <div className="mt-2.5">
      {!showLinkInput ? (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 gap-1.5 text-xs text-muted-foreground"
          onClick={() => setShowLinkInput(true)}
        >
          <Link2 className="size-3.5" />
          Add reference link
        </Button>
      ) : (
        <div>
          <div className="flex items-center gap-2">
            <Input
              type="url"
              placeholder="Paste a Pinterest / Instagram / image link"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button size="sm" onClick={handleSaveReference} disabled={saving}>
              {saving ? <Loader2 className="size-3 animate-spin" /> : "Save"}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setShowLinkInput(false);
                setReferenceUrl("");
                void updateOrderItemDesign(orderId, itemId, { designReferenceUrl: null }).catch(() => {});
                onUpdated?.(itemId, { designImageUrl: imageUrl, designReferenceUrl: null });
              }}
              aria-label="Remove link"
            >
              <X className="size-3.5" />
            </Button>
          </div>
          {referenceUrl && showLinkInput && (
            <a
              href={referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Open reference <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );

  return (
    <section className="rounded-xl border bg-card p-3 sm:p-3.5">
      {header}

      {/* Image preview */}
      {imageUrl ? (
        <figure className="overflow-hidden rounded-lg border bg-muted/30">
          {readOnly ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label={`Open design photo for ${garmentType} full screen`}
              className="block w-full cursor-zoom-in"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`Design for ${garmentType}`}
                className="max-h-72 w-full object-contain"
              />
            </button>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`Design for ${garmentType}`}
                className="max-h-72 w-full object-contain"
              />
            </>
          )}
        </figure>
      ) : readOnly ? null : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="size-5 text-muted-foreground animate-spin" />
          ) : (
            <ImagePlus className="size-5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {uploading ? "Uploading…" : "Upload a design photo"}
          </span>
          <span className="text-xs text-muted-foreground/60">
            JPEG, PNG, WebP · 3-5 MB max
          </span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      {referenceRow}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`Design photo for ${garmentType}`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close full screen view"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl ?? ""}
            alt={`Design for ${garmentType}`}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}