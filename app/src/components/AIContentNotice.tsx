import Link from "next/link";
export function AIContentNotice() {
  return (
    <aside className="ai-content-notice" aria-label="AI disclosure">
      <strong>AI disclosure</strong>
      <p>
        We use AI tools for parts of our research, writing, editing and
        illustrations. Editorial illustrations are not photographs or evidence
        of events. Charts and tables should be read with their dated sources and
        methodology. <Link href="/ai-disclosure/">How we use AI ↗</Link>
      </p>
    </aside>
  );
}
