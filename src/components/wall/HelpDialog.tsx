import { useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "../../lib/wall/use-focus-trap.ts";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function HelpDialog({ open, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(open, ref);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onPointerDown={onClose}>
      <div
        ref={ref}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        tabIndex={-1}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-head">
          <h2 id="help-title">How to move through the wall</h2>
          <button type="button" className="icon-btn" aria-label="Close help" onClick={onClose}>
            <X aria-hidden="true" strokeWidth={1.75} />
          </button>
        </div>
        <ul className="help-list">
          <li>Drag empty space to look around. Drag a note to move only that note.</li>
          <li>Click or tap a note to read it. A small movement will not open it.</li>
          <li>Arrow keys pan the wall. Escape closes this guide, search, or a poem.</li>
          <li>Filter by mood, or search a title, a line, a mood, or a tag.</li>
          <li>Shuffle makes a new arrangement. Reset returns the curated wall.</li>
          <li>The wooden nameplate can be dragged. Place aside moves it out of the way.</li>
        </ul>
      </div>
    </div>
  );
}
