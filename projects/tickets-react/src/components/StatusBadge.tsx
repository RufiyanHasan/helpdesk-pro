import { STATUS_CLASSES } from '../lib/ticket-options';

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`badge ${STATUS_CLASSES[status] ?? ''}`}>{status}</span>;
}
