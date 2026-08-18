import { BookOpenText, ExternalLink } from "lucide-react";
import type { Source } from "@/src/types/chat";

export function SourceCard({ source, index }: { source: Source; index: number }) {
  const content = (
    <>
      <span className="source-icon" aria-hidden="true">
        <BookOpenText size={16} strokeWidth={1.8} />
      </span>
      <span className="source-copy">
        <span className="source-label">Source {index + 1}</span>
        <span className="source-title">{source.title}</span>
        {source.page !== null && source.page !== undefined ? (
          <span className="source-page">Page {source.page}</span>
        ) : null}
      </span>
      {source.url ? <ExternalLink aria-hidden="true" size={14} /> : null}
    </>
  );

  if (source.url) {
    return (
      <a
        className="source-card"
        href={source.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open source: ${source.title}`}
      >
        {content}
      </a>
    );
  }

  return <div className="source-card">{content}</div>;
}
