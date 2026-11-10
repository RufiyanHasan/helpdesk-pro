interface PaginatorProps {
  pageIndex: number;
  pageSize: number;
  total: number;
  onPageChange: (pageIndex: number) => void;
}

// "1 – 25 of 10000", worded like Angular Material's paginator, which the Angular version used.
function rangeLabel(pageIndex: number, pageSize: number, total: number): string {
  if (total === 0) {
    return `0 of ${total}`;
  }
  const start = pageIndex * pageSize;
  const end = Math.min(start + pageSize, total);
  return `${start + 1} – ${end} of ${total}`;
}

const ICONS = {
  first: 'M18.41 16.59 13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z',
  previous: 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z',
  next: 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  last: 'M5.59 7.41 10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z',
};

export default function Paginator({ pageIndex, pageSize, total, onPageChange }: PaginatorProps) {
  const lastIndex = Math.max(Math.ceil(total / pageSize) - 1, 0);
  const buttons: { label: string; icon: keyof typeof ICONS; target: number; disabled: boolean }[] = [
    { label: 'First page', icon: 'first', target: 0, disabled: pageIndex === 0 },
    { label: 'Previous page', icon: 'previous', target: pageIndex - 1, disabled: pageIndex === 0 },
    { label: 'Next page', icon: 'next', target: pageIndex + 1, disabled: pageIndex >= lastIndex },
    { label: 'Last page', icon: 'last', target: lastIndex, disabled: pageIndex >= lastIndex },
  ];

  return (
    <nav className="paginator" aria-label="Select page of tickets">
      <span className="paginator__range">{rangeLabel(pageIndex, pageSize, total)}</span>
      {buttons.map((button) => (
        <button
          className="paginator__button"
          type="button"
          key={button.icon}
          aria-label={button.label}
          disabled={button.disabled}
          onClick={() => onPageChange(button.target)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d={ICONS[button.icon]} />
          </svg>
        </button>
      ))}
    </nav>
  );
}
