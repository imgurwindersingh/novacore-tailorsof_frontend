const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

/** Resolve a relative asset path (e.g. "/api/upload/x.png") to an absolute URL. */
export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** POST /api/upload/image — upload a design image (no auth) */
export async function uploadDesignImage(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/upload/image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(data.error || "Upload failed");
  }

  const { url, filename } = (await res.json()) as { url: string; filename: string };
  return { url: resolveAssetUrl(url), filename };
}

/** PATCH /api/public/orders/:orderId/items/:itemId — update design fields (no auth) */
export async function updateOrderItemDesign(
  orderId: string,
  itemId: string,
  data: { designImageUrl?: string | null; designReferenceUrl?: string | null }
): Promise<{ id: string; designImageUrl: string | null; designReferenceUrl: string | null }> {
  const res = await fetch(`${API_BASE}/api/public/orders/${orderId}/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Update failed" }));
    throw new Error(err.error || "Update failed");
  }

  const updated = (await res.json()) as {
    id: string;
    designImageUrl: string | null;
    designReferenceUrl: string | null;
  };
  return { ...updated, designImageUrl: updated.designImageUrl ? resolveAssetUrl(updated.designImageUrl) : null };
}