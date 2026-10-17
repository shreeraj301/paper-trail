import { LocateFixed, Minus, Plus } from "lucide-react";
import { Tip } from "./Tip.tsx";

type Props = {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
};

export function WallControls({ zoom, onZoomIn, onZoomOut, onRecenter }: Props) {
  const percent = Math.round(zoom * 100);
  return (
    <div className="dock" role="group" aria-label={`Wall view, ${percent} percent`}>
      <Tip label="Zoom out">
        <button type="button" className="icon-btn" aria-label="Zoom out" onClick={onZoomOut}>
          <Minus aria-hidden="true" strokeWidth={1.75} />
        </button>
      </Tip>
      <span className="zoom-readout">{percent}%</span>
      <Tip label="Zoom in">
        <button type="button" className="icon-btn" aria-label="Zoom in" onClick={onZoomIn}>
          <Plus aria-hidden="true" strokeWidth={1.75} />
        </button>
      </Tip>
      <Tip label="Fit notes">
        <button type="button" className="icon-btn" aria-label="Fit notes" onClick={onRecenter}>
          <LocateFixed aria-hidden="true" strokeWidth={1.75} />
        </button>
      </Tip>
    </div>
  );
}
