import { LocateFixed, Minus, Plus } from "lucide-react";

type Props = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
};

export function WallControls({ onZoomIn, onZoomOut, onRecenter }: Props) {
  return (
    <div className="dock" role="group" aria-label="Wall view">
      <button type="button" className="icon-btn" aria-label="Zoom out" onClick={onZoomOut}>
        <Minus aria-hidden="true" strokeWidth={1.75} />
      </button>
      <button type="button" className="icon-btn" aria-label="Zoom in" onClick={onZoomIn}>
        <Plus aria-hidden="true" strokeWidth={1.75} />
      </button>
      <button type="button" className="icon-btn" aria-label="Recenter wall" onClick={onRecenter}>
        <LocateFixed aria-hidden="true" strokeWidth={1.75} />
      </button>
    </div>
  );
}
