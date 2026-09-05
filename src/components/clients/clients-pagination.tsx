import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function pageHref(page: number, q: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("page", String(page));
  return `/clients?${params.toString()}`;
}

function pageWindow(page: number, pages: number): number[] {
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function ClientsPagination({ page, pages, q }: { page: number; pages: number; q: string }) {
  if (pages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={page > 1 ? pageHref(page - 1, q) : undefined}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {pageWindow(page, pages).map((p) => (
          <PaginationItem key={p}>
            <PaginationLink href={pageHref(p, q)} isActive={p === page}>
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href={page < pages ? pageHref(page + 1, q) : undefined}
            aria-disabled={page >= pages}
            className={page >= pages ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
