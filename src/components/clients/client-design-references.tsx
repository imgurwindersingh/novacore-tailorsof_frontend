import { PublicDesignUpload } from "@/components/clients/public-design-upload";
import type { OrderDetail } from "@/lib/types";

export function ClientDesignReferences({ orders }: { orders: OrderDetail[] }) {
  const items = orders
    .flatMap((order) =>
      order.items
        .filter((item) => item.designImageUrl || item.designReferenceUrl)
        .map((item) => ({ ...item, orderId: order.id }))
    );

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-lg font-semibold">Design references</h2>
        <p className="text-sm text-muted-foreground">
          Images and links the client shared for their orders.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <PublicDesignUpload
            key={item.id}
            orderId={item.orderId}
            itemId={item.id}
            garmentType={item.garmentType}
            readOnly
            initialImageUrl={item.designImageUrl}
            initialReferenceUrl={item.designReferenceUrl}
          />
        ))}
      </div>
    </div>
  );
}