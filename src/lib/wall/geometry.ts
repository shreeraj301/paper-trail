import { poems, type Mood, type PaperType, type Poem } from "../../data/poems.ts";

export type Position = {
  x: number;
  y: number;
  rotation: number;
};

export type Camera = {
  x: number;
  y: number;
  zoom: number;
};

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Size = {
  w: number;
  h: number;
};

export const ZOOM_MIN = 0.55;
export const ZOOM_MAX = 1.65;
export const DRAG_THRESHOLD = 6;

export const WORLD = {
  minX: -200,
  minY: -160,
  maxX: 2400,
  maxY: 3200,
};

/** Opening view: the first rows of the wall, with the rest waiting below. */
export const HOME_BOUNDS: Rect = { x: 20, y: 8, w: 1560, h: 980 };

const PAPER_SIZE: Record<PaperType, Size> = {
  sticky: { w: 188, h: 188 },
  torn: { w: 214, h: 246 },
  folded: { w: 204, h: 226 },
  postcard: { w: 252, h: 172 },
  letter: { w: 228, h: 268 },
  plain: { w: 220, h: 252 },
};

const SHUFFLE_ROTATIONS = [-2.4, -1.6, -0.8, 0.5, 1.2, 1.9, 2.4, -2.1];

export function paperSize(poem: Pick<Poem, "paperType">): Size {
  return PAPER_SIZE[poem.paperType];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function curatedPositions(source: Poem[] = poems): Record<string, Position> {
  const positions: Record<string, Position> = {};
  for (const poem of source) {
    positions[poem.id] = {
      x: poem.initialX,
      y: poem.initialY,
      rotation: poem.rotation,
    };
  }
  return positions;
}

export function boundsOf(
  list: Poem[],
  positions: Record<string, Position>,
  pad = 0,
): Rect | null {
  if (list.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const poem of list) {
    const pos = positions[poem.id];
    if (!pos) continue;
    const size = paperSize(poem);
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + size.w);
    maxY = Math.max(maxY, pos.y + size.h);
  }
  if (!Number.isFinite(minX)) return null;
  return {
    x: minX - pad,
    y: minY - pad,
    w: maxX - minX + pad * 2,
    h: maxY - minY + pad * 2,
  };
}

type FrameOptions = {
  maxZoom?: number;
  padX?: number;
  padTop?: number;
  padBottom?: number;
};

export function frameCamera(bounds: Rect, viewport: Size, options: FrameOptions = {}): Camera {
  const padX = options.padX ?? 48;
  const padTop = options.padTop ?? 112;
  const padBottom = options.padBottom ?? 88;
  const availW = Math.max(viewport.w - padX * 2, 120);
  const availH = Math.max(viewport.h - padTop - padBottom, 120);
  const zoom = clamp(
    Math.min(availW / Math.max(bounds.w, 1), availH / Math.max(bounds.h, 1), options.maxZoom ?? 1.12),
    ZOOM_MIN,
    ZOOM_MAX,
  );
  return {
    zoom,
    x: padX + (availW - bounds.w * zoom) / 2 - bounds.x * zoom,
    y: padTop + (availH - bounds.h * zoom) / 2 - bounds.y * zoom,
  };
}

export function composedCamera(viewport: Size): Camera {
  if (viewport.w < 744) {
    return frameCamera({ x: 48, y: 24, w: 780, h: 640 }, viewport, {
      maxZoom: 0.95,
      padTop: 128,
      padBottom: 104,
      padX: 16,
    });
  }
  return frameCamera(HOME_BOUNDS, viewport, {
    maxZoom: 1.05,
    padTop: 108,
    padBottom: 80,
    padX: 36,
  });
}

export function zoomAt(camera: Camera, sx: number, sy: number, nextZoom: number): Camera {
  const zoom = clamp(nextZoom, ZOOM_MIN, ZOOM_MAX);
  const worldX = (sx - camera.x) / camera.zoom;
  const worldY = (sy - camera.y) / camera.zoom;
  return {
    zoom,
    x: sx - worldX * zoom,
    y: sy - worldY * zoom,
  };
}

export function searchPoems(list: Poem[], query: string): Poem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return list.filter((poem) => {
    if (poem.title.toLowerCase().includes(needle)) return true;
    if (poem.body.toLowerCase().includes(needle)) return true;
    if (poem.mood.toLowerCase().includes(needle)) return true;
    return poem.tags.some((tag) => tag.toLowerCase().includes(needle));
  });
}

export function poemMatchesMood(poem: Poem, mood: Mood | "all"): boolean {
  return mood === "all" || poem.mood === mood;
}

/** Pack notes into a compact block, keeping their left-to-right, top-to-bottom order. */
export function clusterPositions(
  list: Poem[],
  source: Record<string, Position>,
  maxRowWidth: number,
): Record<string, Position> {
  const ordered = [...list].sort((a, b) => {
    const pa = source[a.id];
    const pb = source[b.id];
    if (!pa || !pb) return a.title.localeCompare(b.title);
    if (Math.abs(pa.y - pb.y) > 36) return pa.y - pb.y;
    return pa.x - pb.x;
  });
  const next: Record<string, Position> = { ...source };
  const gap = 28;
  const originX = 48;
  const rowWidth = Math.max(maxRowWidth, 280);
  let x = originX;
  let y = 40;
  let rowH = 0;
  for (const poem of ordered) {
    const size = paperSize(poem);
    if (x > originX && x + size.w > originX + rowWidth) {
      x = originX;
      y += rowH + gap;
      rowH = 0;
    }
    next[poem.id] = { x, y, rotation: source[poem.id]?.rotation ?? 0 };
    x += size.w + gap;
    rowH = Math.max(rowH, size.h);
  }
  return next;
}

/** Move the camera so `bounds` sits in view without changing zoom. */
export function panKeepingZoom(
  bounds: Rect,
  viewport: Size,
  zoom: number,
  padTop = 120,
): Camera {
  const safeZoom = clamp(zoom, ZOOM_MIN, ZOOM_MAX);
  const viewW = Math.max(viewport.w - 32, 120);
  const x = (viewW - bounds.w * safeZoom) / 2 + 16 - bounds.x * safeZoom;
  const y = padTop - bounds.y * safeZoom;
  return { zoom: safeZoom, x, y };
}

function overlapAmount(a: Rect, b: Rect): { x: number; y: number } {
  return {
    x: Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x),
    y: Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y),
  };
}

export function overlapRatio(a: Rect, b: Rect): number {
  const overlap = overlapAmount(a, b);
  if (overlap.x <= 0 || overlap.y <= 0) return 0;
  const area = overlap.x * overlap.y;
  const minArea = Math.min(a.w * a.h, b.w * b.h);
  return minArea === 0 ? 0 : area / minArea;
}

export function paperRect(poem: Poem, position: Position): Rect {
  const size = paperSize(poem);
  return { x: position.x, y: position.y, w: size.w, h: size.h };
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Mulberry32. Shuffle can be seeded so tests stay stable. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function shufflePositions(
  source: Poem[] = poems,
  seed = Math.floor(Math.random() * 0xffffffff),
): Record<string, Position> {
  const rng = mulberry32(seed || 1);
  const items = [...source];
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = items[i];
    items[i] = items[j]!;
    items[j] = swap!;
  }

  const cols = source.length > 20 ? 5 : source.length > 12 ? 4 : 3;
  const cellW = 304;
  const cellH = 304;
  const originX = 56;
  const originY = 40;
  const placed: { poem: Poem; x: number; y: number; rotation: number }[] = [];

  items.forEach((poem, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const size = paperSize(poem);
    const jitterX = (rng() - 0.5) * 26;
    const jitterY = (rng() - 0.5) * 22;
    placed.push({
      poem,
      x: originX + col * cellW + jitterX + (row % 2 === 0 ? 0 : 18),
      y: originY + row * cellH + jitterY,
      rotation: SHUFFLE_ROTATIONS[(index + (seed % 3)) % SHUFFLE_ROTATIONS.length]!,
    });
    void size;
  });

  for (let pass = 0; pass < 10; pass += 1) {
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        const a = placed[i]!;
        const b = placed[j]!;
        const aSize = paperSize(a.poem);
        const bSize = paperSize(b.poem);
        const gap = 16;
        const overlap = overlapAmount(
          { x: a.x, y: a.y, w: aSize.w, h: aSize.h },
          { x: b.x, y: b.y, w: bSize.w, h: bSize.h },
        );
        if (overlap.x <= 0 || overlap.y <= 0) continue;
        if (overlap.x < overlap.y) {
          const push = (overlap.x + gap) / 2;
          const dir = a.x <= b.x ? -1 : 1;
          a.x += dir * push;
          b.x -= dir * push;
        } else {
          const push = (overlap.y + gap) / 2;
          const dir = a.y <= b.y ? -1 : 1;
          a.y += dir * push;
          b.y -= dir * push;
        }
      }
    }
  }

  const positions: Record<string, Position> = {};
  for (const item of placed) {
    const size = paperSize(item.poem);
    positions[item.poem.id] = {
      x: clamp(item.x, 24, WORLD.maxX - size.w - 24),
      y: clamp(item.y, 24, WORLD.maxY - size.h - 24),
      rotation: item.rotation,
    };
  }
  return positions;
}

export function maxOverlap(source: Poem[], positions: Record<string, Position>): number {
  let max = 0;
  for (let i = 0; i < source.length; i += 1) {
    for (let j = i + 1; j < source.length; j += 1) {
      const a = source[i]!;
      const b = source[j]!;
      const ratio = overlapRatio(paperRect(a, positions[a.id]!), paperRect(b, positions[b.id]!));
      if (ratio > max) max = ratio;
    }
  }
  return max;
}

export function hintStorageKey(): string {
  return "the-wall.hintDismissed";
}

export function readHintDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(hintStorageKey()) === "1";
  } catch {
    return false;
  }
}

export function writeHintDismissed(): void {
  try {
    window.localStorage.setItem(hintStorageKey(), "1");
  } catch {
    /* ignore private-mode and malformed storage */
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function stableSeed(label: string): number {
  return hashString(label);
}
