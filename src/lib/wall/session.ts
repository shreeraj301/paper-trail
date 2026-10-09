import { useSyncExternalStore } from "react";
import { poems, type Mood } from "../../data/poems.ts";
import { curatedPositions, type Camera, type Position } from "./geometry.ts";

export type NameplateState = {
  x: number;
  y: number;
  placed: boolean;
};

export type WallSession = {
  positions: Record<string, Position>;
  camera: Camera;
  mood: Mood | "all";
  framed: boolean;
  nameplate: NameplateState;
};

const initialSession: WallSession = {
  positions: curatedPositions(poems),
  camera: { x: 48, y: 96, zoom: 1 },
  mood: "all",
  framed: false,
  nameplate: { x: 16, y: 0, placed: false },
};

let session: WallSession = initialSession;
const listeners = new Set<() => void>();

export function getSession(): WallSession {
  return session;
}

export function getServerSession(): WallSession {
  return initialSession;
}

export function updateSession(updater: (current: WallSession) => WallSession): void {
  session = updater(session);
  listeners.forEach((listener) => listener());
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useWallSession(): WallSession {
  return useSyncExternalStore(subscribeSession, getSession, getServerSession);
}
