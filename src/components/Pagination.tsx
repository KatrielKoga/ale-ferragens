import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export function Pagination({
  page,
  hasMore,
  setPage,
}: {
  page: number;
  hasMore: boolean;
  setPage: (p: (page: number) => number) => void;
}) {
  return (
    <div className="flex gap-2 mt-4">
      <button
        disabled={page === 1}
        onClick={() => setPage((p: number) => Math.max(1, p - 1))}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      <span>Página {page}</span>
      <button
        disabled={!hasMore}
        onClick={() => setPage((p: number) => p + 1)}
        className="px-2 py-1 border rounded disabled:opacity-50"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
