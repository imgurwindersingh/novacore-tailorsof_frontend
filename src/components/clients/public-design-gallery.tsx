"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ImageIcon, X } from "lucide-react";
import { PublicDesignUpload } from "./public-design-upload";
import { resolveAssetUrl } from "@/lib/api/public";
import type { PublicOrderDetail } from "@/lib/types";

export function PublicDesignGallery({ orders }: { orders: PublicOrderDetail[] }) {
  const items = orders.flatMap((order) =>
    order.items.map((item) => ({ ...item, orderId: order.id, orderStatus: order.status }))
  );

  const editableItems = items.filter((item) => item.orderStatus !== "DELIVERED");
  const deliveredItems = items.filter(
    (item) =>
      item.orderStatus === "DELIVERED" &&
      (item.designImageUrl || item.designReferenceUrl)
  );

  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  if (editableItems.length === 0 && deliveredItems.length === 0) return null;

  return (
    <section className="mt-8 space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-semibold">Designs &amp; references</h2>
        <p className="text-sm text-muted-foreground">
          Reference images and links for your orders. You can add or update them
          here while an order is in progress.
        </p>
      </div>

      {/* Upload / edit attachments for orders still in progress */}
      {editableItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {editableItems.map((item) => (
            <PublicDesignUpload
              key={item.id}
              orderId={item.orderId}
              itemId={item.id}
              garmentType={item.garmentType}
              initialImageUrl={item.designImageUrl}
              initialReferenceUrl={item.designReferenceUrl}
            />
          ))}
        </div>
      ) : null}

      {/* Read-only gallery for delivered orders */}
      {deliveredItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {deliveredItems.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-xl border bg-card">
              {item.designImageUrl ? (
                <button
                  type="button"
                  onClick={() => setLightbox(resolveAssetUrl(item.designImageUrl))}
                  aria-label={`Open design for ${item.garmentType} full screen`}
                  className="block w-full cursor-zoom-in bg-muted/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveAssetUrl(item.designImageUrl)}
                    alt={`Design for ${item.garmentType}`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </button>
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-muted/30 text-muted-foreground">
                  <ImageIcon className="size-6" />
                </div>
              )}
              <figcaption className="flex items-center justify-between gap-2 px-3 py-2.5">
                <span className="text-sm font-medium">
                  {item.garmentType}
                  {item.designReferenceUrl || (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">No link</span>
                  )}
                </span>
                {item.designReferenceUrl ? (
                  <a
                    href={item.designReferenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    Reference
                  </a>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      {lightbox ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Design photo"
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close full screen view"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Design reference"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}