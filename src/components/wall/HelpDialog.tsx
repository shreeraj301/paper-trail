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
          <li>The wheel moves the wall. Hold Ctrl, or pinch, to zoom. The percentage sits by the zoom buttons.</li>
          <li>Arrow keys pan the wall. Escape closes this guide, search, or a poem.</li>
          <li>Filter by mood, or search a title, a line, a mood, or a tag. Matching notes stay bright.</li>
          <li>Shuffle makes a new arrangement. Restore puts the original wall back. Fit notes fills the window.</li>
          <li>Place aside tucks the nameplate away. Show nameplate brings it back.</li>
        </ul>
      </div>
    </div>
  );
}
