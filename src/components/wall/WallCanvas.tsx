import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import type { Poem } from "../../data/poems.ts";
import {
  DRAG_THRESHOLD,
  clamp,
  zoomAt,
  WORLD,
  type Camera,
  type Position,
} from "../../lib/wall/geometry.ts";
import { PaperPoem } from "./PaperPoem.tsx";

type Drag =
  | {
      kind: "pan";
      pointerId: number;
      lastX: number;
      lastY: number;
      moved: boolean;
    }
  | {
      kind: "paper";
      pointerId: number;
      id: string;
      startX: number;
      startY: number;
      origX: number;
      origY: number;
      moved: boolean;
    };

type Props = {
  poems: Poem[];
  positions: Record<string, Position>;
  camera: Camera;
  shownIds: Set<string>;
  selectedId: string | null;
  settling: boolean;
  locked: boolean;
  viewportRef: RefObject<HTMLDivElement | null>;
  onCamera: (camera: Camera) => void;
  onMovePaper: (id: string, x: number, y: number) => void;
  onOpen: (id: string) => void;
  onPan: () => void;
};

export function WallCanvas({
  poems,
  positions,
  camera,
  shownIds,
  selectedId,
  settling,
  locked,
  viewportRef,
  onCamera,
  onMovePaper,
  onOpen,
  onPan,
}: Props) {
  const cameraRef = useRef(camera);
  const positionsRef = useRef(positions);
  const lockedRef = useRef(locked);
  const dragRef = useRef<Drag | null>(null);
  const blockClickRef = useRef(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);

  cameraRef.current = camera;
  positionsRef.current = positions;
  lockedRef.current = locked;

  const onCameraRef = useRef(onCamera);
  const onMoveRef = useRef(onMovePaper);
  const onPanRef = useRef(onPan);
  onCameraRef.current = onCamera;
  onMoveRef.current = onMovePaper;
  onPanRef.current = onPan;

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (lockedRef.current) return;
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      const current = cameraRef.current;
      const factor = Math.exp(-event.deltaY * 0.00115);
      onCameraRef.current(
        zoomAt(current, event.clientX - rect.left, event.clientY - rect.top, current.zoom * factor),
      );
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [viewportRef]);

  const endDrag = (movedPan: boolean) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDraggingId(null);
    setPanning(false);
    if (drag?.kind === "paper" && drag.moved) blockClickRef.current = true;
    if (movedPan) onPanRef.current();
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (lockedRef.current || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest(".paper")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      kind: "pan",
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
      moved: false,
    };
    setPanning(true);
  };

  const onPaperPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, poemId: string) => {
    if (lockedRef.current || event.button !== 0) return;
    event.stopPropagation();
    const position = positionsRef.current[poemId];
    if (!position) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      kind: "paper",
      pointerId: event.pointerId,
      id: poemId,
      startX: event.clientX,
      startY: event.clientY,
      origX: position.x,
      origY: position.y,
      moved: false,
    };
    setDraggingId(poemId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.kind === "pan") {
      const dx = event.clientX - drag.lastX;
      const dy = event.clientY - drag.lastY;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      if (dx !== 0 || dy !== 0) drag.moved = true;
      if (!drag.moved) return;
      const current = cameraRef.current;
      onCameraRef.current({ ...current, x: current.x + dx, y: current.y + dy });
      return;
    }
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) >= DRAG_THRESHOLD) drag.moved = true;
    if (!drag.moved) return;
    const zoom = cameraRef.current.zoom || 1;
    onMoveRef.current(
      drag.id,
      clamp(drag.origX + dx / zoom, WORLD.minX, WORLD.maxX),
      clamp(drag.origY + dy / zoom, WORLD.minY, WORLD.maxY),
    );
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    endDrag(drag.kind === "pan" && drag.moved);
  };

  return (
    <div
      id="wall"
      ref={viewportRef}
      className={panning ? "viewport is-panning" : "viewport"}
      data-testid="wall"
      tabIndex={-1}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className={settling ? "world is-settling" : "world"}
        style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}
      >
        {poems.map((poem) => {
          const position = positions[poem.id];
          if (!position) return null;
          return (
            <PaperPoem
              key={poem.id}
              poem={poem}
              position={position}
              shown={shownIds.has(poem.id)}
              selected={selectedId === poem.id}
              dragging={draggingId === poem.id}
              onPointerDown={onPaperPointerDown}
              onClick={(id) => {
                if (blockClickRef.current) {
                  blockClickRef.current = false;
                  return;
                }
                onOpen(id);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
