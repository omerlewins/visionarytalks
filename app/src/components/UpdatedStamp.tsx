import { updatedLabel } from "@/lib/home-editorial";
export function UpdatedStamp({ date }: { date?: string }) {
  return date ? (
    <time className="updated-stamp" dateTime={date}>
      Updated {updatedLabel(date)}
    </time>
  ) : null;
}
