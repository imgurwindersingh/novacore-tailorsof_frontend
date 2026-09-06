"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ClientSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const [value, setValue] = useState(initialQuery);
  const debounced = useDebounce(value, 300);

  useEffect(() => {
    if (debounced === initialQuery) return;
    const params = new URLSearchParams();
    if (debounced) params.set("q", debounced);
    routerRef.current.push(
      params.toString() ? `/clients?${params.toString()}` : "/clients"
    );
    // intentionally omit routerRef — it's a stable ref wrapper
    // intentionally omit initialQuery — we only want to react to debounced changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Search className="size-5 text-muted-foreground" />
        </div>
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search by name, mobile or order code"
          className="border-0 p-0 shadow-none focus-visible:ring-0"
          aria-label="Search clients"
        />
      </CardContent>
    </Card>
  );
}
