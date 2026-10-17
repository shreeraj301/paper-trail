import { useEffect, useRef, useState } from "react";
import { Check, Link, X } from "lucide-react";
import type { Poem } from "../../data/poems.ts";
import { useFocusTrap } from "../../lib/wall/use-focus-trap.ts";

type Props = {
  poem: Poem;
  onClose: () => void;
};

export function PoemReader({ poem, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const stanzas = poem.body.split(/\n{2,}/);

  useFocusTrap(true, ref);

  useEffect(() => {
    setCopyState("idle");
  }, [poem.id]);

  const copyLink = async () => {
    const url = `${window.location.origin}/poem/${poem.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <div className="reader-backdrop" onPointerDown={onClose}>
      <div
        ref={ref}
        className="reader-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reader-title"
        tabIndex={-1}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="reader-toolbar">
          <p className="reader-meta">
            <span className="reader-mood">
              <span className={`swatch swatch-${poem.mood.toLowerCase()}`} aria-hidden="true" />
              {poem.mood}
            </span>
            {poem.date ? <span>{poem.date}</span> : null}
          </p>
          <button type="button" className="icon-btn" aria-label="Close poem" onClick={onClose}>
            <X aria-hidden="true" strokeWidth={1.75} />
          </button>
        </div>
        <h2 id="reader-title" className="reader-title">
          {poem.title}
        </h2>
        <div className="reader-body">
          {stanzas.map((stanza, index) => (
            <p key={`${poem.id}-${index}`} className="stanza">
              {stanza}
            </p>
          ))}
        </div>
        <div className="reader-actions">
          <button type="button" className="secondary-btn" aria-label="Copy link" onClick={() => void copyLink()}>
            {copyState === "copied" ? (
              <Check aria-hidden="true" strokeWidth={1.75} />
            ) : (
              <Link aria-hidden="true" strokeWidth={1.75} />
            )}
            <span aria-hidden="true">{copyState === "copied" ? "Link copied" : "Copy link"}</span>
          </button>
          {copyState === "failed" ? (
            <p className="copy-fallback" role="status">
              Copy from here:{" "}
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/poem/${poem.slug}`}
                aria-label="Poem link"
                onFocus={(event) => event.currentTarget.select()}
              />
            </p>
          ) : (
            <p className="sr-only" aria-live="polite">
              {copyState === "copied" ? "Link copied" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
