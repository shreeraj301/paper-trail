import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { clamp, prefersReducedMotion } from "../../lib/wall/geometry.ts";
import { getSession, updateSession, useWallSession } from "../../lib/wall/session.ts";

const PLATE_H = 104;

function plateWidth(vw: number): number {
  return vw < 744 ? 148 : 214;
}

function topLimit(): number {
  if (typeof window === "undefined") return 88;
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--toolbar-offset");
  const parsed = Number.parseFloat(raw);
  return (Number.isFinite(parsed) ? parsed : 72) + 12;
}

const DRAG_THRESHOLD = 4;

function dockBox(vw: number, vh: number): { x: number; y: number; w: number; h: number } {
  const dock = document.querySelector(".dock");
  if (dock instanceof HTMLElement) {
    const rect = dock.getBoundingClientRect();
    if (rect.width > 0) return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
  }
  return { x: vw - 12 - 168, y: vh - 12 - 44, w: 168, h: 44 };
}

function clampPlate(x: number, y: number, vw: number, vh: number): { x: number; y: number } {
  const margin = 12;
  const width = plateWidth(vw);
  const dock = dockBox(vw, vh);
  let nextX = clamp(x, margin, Math.max(margin, vw - width - margin));
  let nextY = clamp(y, topLimit(), Math.max(topLimit(), vh - PLATE_H - margin));
  const overlapsDock =
    nextX < dock.x + dock.w &&
    nextX + width > dock.x &&
    nextY < dock.y + dock.h &&
    nextY + PLATE_H > dock.y;
  if (overlapsDock) {
    const above = dock.y - PLATE_H - 8;
    if (above >= topLimit()) nextY = above;
    else nextX = clamp(dock.x - width - 8, margin, Math.max(margin, vw - width - margin));
  }
  return { x: nextX, y: nextY };
}

function defaultPlate(vw: number, vh: number): { x: number; y: number } {
  return clampPlate(16, vh - PLATE_H - 16, vw, vh);
}

export function Nameplate() {
  const session = useWallSession();
  const restoreRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    lastX: number;
    lastTime: number;
    velocity: number;
    moved: boolean;
  } | null>(null);
  const frameRef = useRef(0);
  const [angle, setAngle] = useState(0);

  useLayoutEffect(() => {
    const place = () => {
      const current = getSession().nameplate;
      const next = current.placed
        ? clampPlate(current.x, current.y, window.innerWidth, window.innerHeight)
        : defaultPlate(window.innerWidth, window.innerHeight);
      if (!current.aside && (!current.placed || next.x !== current.x || next.y !== current.y)) {
        updateSession((sessionState) => ({
          ...sessionState,
          nameplate: { ...sessionState.nameplate, ...next, placed: true },
        }));
      }
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  useLayoutEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const swing = (velocity: number) => {
    cancelAnimationFrame(frameRef.current);
    if (prefersReducedMotion() || Math.abs(velocity) < 0.35) {
      setAngle(0);
      return;
    }
    let rotation = 0;
    let vel = clamp(velocity, -16, 16);
    const step = () => {
      vel += -rotation * 0.16;
      vel *= 0.84;
      rotation += vel;
      if (Math.abs(rotation) < 0.08 && Math.abs(vel) < 0.08) {
        setAngle(0);
        return;
      }
      setAngle(rotation);
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest("button")) return;
    event.stopPropagation();
    cancelAnimationFrame(frameRef.current);
    setAngle(0);
    const point = session.nameplate.placed
      ? session.nameplate
      : defaultPlate(window.innerWidth, window.innerHeight);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origX: point.x,
      origY: point.y,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      moved: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) >= DRAG_THRESHOLD) drag.moved = true;
    const dt = Math.max(16, event.timeStamp - drag.lastTime);
    drag.velocity = ((event.clientX - drag.lastX) / dt) * 18;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    if (!drag.moved) return;
    const next = clampPlate(
      drag.origX + dx,
      drag.origY + dy,
      window.innerWidth,
      window.innerHeight,
    );
    updateSession((current) => ({
      ...current,
      nameplate: { ...current.nameplate, ...next, placed: true },
    }));
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (drag.moved) swing(drag.velocity);
  };

  const placeAside = () => {
    updateSession((current) => ({
      ...current,
      nameplate: { ...current.nameplate, aside: true, placed: true },
    }));
    setAngle(0);
    window.requestAnimationFrame(() => restoreRef.current?.focus());
  };

  const showPlate = () => {
    updateSession((current) => ({
      ...current,
      nameplate: { ...current.nameplate, aside: false, placed: true },
    }));
    window.requestAnimationFrame(() => plateRef.current?.focus());
  };

  const nudge = (dx: number, dy: number) => {
    const current = getSession().nameplate;
    const base = current.placed ? current : defaultPlate(window.innerWidth, window.innerHeight);
    const next = clampPlate(base.x + dx, base.y + dy, window.innerWidth, window.innerHeight);
    updateSession((sessionState) => ({
      ...sessionState,
      nameplate: { ...sessionState.nameplate, ...next, placed: true },
    }));
  };

  const placed = session.nameplate.placed;
  const aside = session.nameplate.aside;
  const plateRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {aside ? (
        <button
          ref={restoreRef}
          type="button"
          className="nameplate-restore"
          onClick={showPlate}
        >
          Show nameplate
        </button>
      ) : null}
      <div
        ref={plateRef}
        className={
          aside ? "nameplate is-placed is-aside" : placed ? "nameplate is-placed" : "nameplate"
        }
        style={
          placed
            ? {
                left: aside ? -260 : session.nameplate.x,
                top: session.nameplate.y,
                transform: `rotate(${angle}deg)`,
              }
            : { transform: `rotate(${angle}deg)` }
        }
        tabIndex={aside ? -1 : 0}
        aria-hidden={aside || undefined}
        inert={aside || undefined}
        role="group"
        aria-label="Paper Trail nameplate. Drag to move it. Arrow keys nudge it when focused."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(event) => {
        const step = 16;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          event.stopPropagation();
          nudge(-step, 0);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          event.stopPropagation();
          nudge(step, 0);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          event.stopPropagation();
          nudge(0, -step);
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          event.stopPropagation();
          nudge(0, step);
        }
      }}
    >
      <span className="nameplate-screw" aria-hidden="true" />
      <span className="nameplate-text">
        <span className="nameplate-title">Paper Trail</span>
        <span className="nameplate-sub">by Shreeraj Narwade</span>
      </span>
      <span className="nameplate-screw" aria-hidden="true" />
      <button type="button" className="nameplate-aside" onClick={placeAside}>
        Place aside
      </button>
    </div>
    </>
  );
}
