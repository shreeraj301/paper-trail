import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CircleHelp, RotateCcw, Shuffle } from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { MOODS, getPoemById, getPoemBySlug, poems, type Mood, type Poem } from "../../data/poems.ts";
import {
  boundsOf,
  clusterPositions,
  composedCamera,
  curatedPositions,
  frameCamera,
  panKeepingZoom,
  paperSize,
  poemMatchesMood,
  readHintDismissed,
  searchPoems,
  shufflePositions,
  writeHintDismissed,
  zoomAt,
  type Camera,
  type Position,
} from "../../lib/wall/geometry.ts";
import {
  clearFocusPoem,
  getSession,
  peekFocusPoem,
  rememberFocusPoem,
  updateSession,
  useWallSession,
} from "../../lib/wall/session.ts";
import { HelpDialog } from "./HelpDialog.tsx";
import { MoodFilter } from "./MoodFilter.tsx";
import { Nameplate } from "./Nameplate.tsx";
import { PoemReader } from "./PoemReader.tsx";
import { PoemSearch } from "./PoemSearch.tsx";
import { QuietState } from "./QuietState.tsx";
import { Tip } from "./Tip.tsx";
import { WallCanvas } from "./WallCanvas.tsx";
import { WallControls } from "./WallControls.tsx";

function usePoemSlug(): string | null {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const match = pathname.match(/^\/poem\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function moodFromSearch(searchStr: string): Mood | "all" {
  const value = new URLSearchParams(searchStr.startsWith("?") ? searchStr.slice(1) : searchStr).get(
    "mood",
  );
  if (!value) return "all";
  return MOODS.find((item) => item.toLowerCase() === value.toLowerCase()) ?? "all";
}

function statusText(mood: Mood | "all", moodCount: number, query: string, matchCount: number): string {
  const trimmed = query.trim();
  if (mood !== "all" && moodCount === 0) return `No ${mood} poems yet`;
  if (trimmed && matchCount === 0) {
    return mood === "all" ? "No poems match this search" : `No ${mood} poems match this search`;
  }
  if (trimmed) {
    const noun = matchCount === 1 ? "poem" : "poems";
    return mood === "all" ? `${matchCount} ${noun}` : `${matchCount} ${mood} ${noun}`;
  }
  if (mood !== "all") {
    const noun = moodCount === 1 ? "poem" : "poems";
    return `${moodCount} ${mood} ${noun}`;
  }
  return "";
}

export function WallPage() {
  const session = useWallSession();
  const slug = usePoemSlug();
  const searchStr = useRouterState({ select: (state) => state.location.searchStr });
  const openPoem = slug ? getPoemBySlug(slug) : undefined;
  const navigate = useNavigate();
  const viewportRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const settleTimer = useRef(0);
  const helpWasOpen = useRef(false);
  const returnFocusId = useRef<string | null>(null);
  const savedPositions = useRef<Record<string, Position> | null>(null);
  const moodRef = useRef<Mood | "all">(session.mood);
  const [settling, setSettling] = useState(false);
  const [query, setQuery] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [hint, setHint] = useState<"unknown" | "show" | "hide">("unknown");
  const [actionNote, setActionNote] = useState("");
  const [liveStatus, setLiveStatus] = useState("");

  const results = useMemo(
    () => searchPoems(poems, query).filter((poem) => poemMatchesMood(poem, session.mood)),
    [query, session.mood],
  );
  const visiblePoems = useMemo(
    () => poems.filter((poem) => poemMatchesMood(poem, session.mood)),
    [session.mood],
  );
  const shownIds = useMemo(() => {
    const ids = new Set(visiblePoems.map((poem) => poem.id));
    if (openPoem) ids.add(openPoem.id);
    return ids;
  }, [openPoem, visiblePoems]);
  const matchIds = useMemo(() => {
    if (!query.trim()) return null;
    return new Set(results.map((poem) => poem.id));
  }, [query, results]);
  const matchCount = results.length;

  useEffect(() => {
    setHint(readHintDismissed() ? "hide" : "show");
  }, []);

  useLayoutEffect(() => {
    const element = toolbarRef.current;
    if (!element) return;
    const apply = () => {
      document.documentElement.style.setProperty("--toolbar-offset", `${element.offsetHeight}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element || getSession().framed) return;
    const viewport = { w: element.clientWidth, h: element.clientHeight };
    let camera = composedCamera(viewport);
    if (openPoem) {
      const position = getSession().positions[openPoem.id];
      if (position) {
        const size = paperSize(openPoem);
        camera = frameCamera(
          { x: position.x - 72, y: position.y - 56, w: size.w + 144, h: size.h + 128 },
          viewport,
          { maxZoom: 1.05, padTop: 124, padBottom: 96, padX: 28 },
        );
      }
    }
    updateSession((current) => ({ ...current, camera, framed: true }));
  }, [openPoem]);

  useEffect(() => {
    if (openPoem) {
      rememberFocusPoem(openPoem.id);
      returnFocusId.current = openPoem.id;
      return;
    }
    const id = peekFocusPoem() ?? returnFocusId.current;
    if (!id) return;
    const frame = window.requestAnimationFrame(() => {
      const note = document.getElementById(`paper-${id}`);
      if (note instanceof HTMLElement && note.tabIndex >= 0) note.focus();
      else toolbarRef.current?.focus();
      clearFocusPoem();
      returnFocusId.current = null;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [openPoem]);

  useEffect(() => {
    const next = statusText(session.mood, visiblePoems.length, query, matchCount);
    const handle = window.setTimeout(() => setLiveStatus(next), query.trim() ? 400 : 0);
    return () => window.clearTimeout(handle);
  }, [matchCount, query, session.mood, visiblePoems.length]);

  useEffect(() => {
    if (!actionNote) return;
    const handle = window.setTimeout(() => setActionNote(""), 2400);
    return () => window.clearTimeout(handle);
  }, [actionNote]);

  useEffect(() => {
    if (!helpOpen && helpWasOpen.current) helpButtonRef.current?.focus();
    helpWasOpen.current = helpOpen;
  }, [helpOpen]);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  const viewportSize = useCallback(() => {
    const element = viewportRef.current;
    return {
      w: element?.clientWidth ?? (typeof window === "undefined" ? 1280 : window.innerWidth),
      h: element?.clientHeight ?? (typeof window === "undefined" ? 800 : window.innerHeight),
    };
  }, []);

  const settle = useCallback((camera: Camera) => {
    setSettling(true);
    updateSession((current) => ({ ...current, camera }));
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => setSettling(false), 340);
  }, []);

  const note = useCallback((message: string) => {
    setActionNote(message);
  }, []);

  const layoutForMood = useCallback(
    (mood: Mood | "all") => {
      const view = viewportSize();
      const zoom = getSession().camera.zoom;
      if (mood === "all") {
        const positions = savedPositions.current ?? getSession().positions;
        savedPositions.current = null;
        updateSession((current) => ({ ...current, mood, positions }));
        const bounds = boundsOf(poems, positions, 16);
        if (bounds) settle(panKeepingZoom(bounds, view, zoom));
        return;
      }
      if (!savedPositions.current || moodRef.current === "all") {
        savedPositions.current = getSession().positions;
      }
      const base = savedPositions.current;
      const list = poems.filter((poem) => poemMatchesMood(poem, mood));
      if (list.length === 0) {
        updateSession((current) => ({ ...current, mood, positions: base }));
        return;
      }
      const row = Math.max(420, (view.w - 64) / Math.max(zoom, 0.55));
      const positions = clusterPositions(list, base, row);
      updateSession((current) => ({ ...current, mood, positions }));
      const bounds = boundsOf(list, positions, 16);
      if (bounds) settle(panKeepingZoom(bounds, view, zoom, 132));
    },
    [settle, viewportSize],
  );

  const writeMoodUrl = useCallback(
    (mood: Mood | "all") => {
      const params = new URLSearchParams(window.location.search);
      if (mood === "all") params.delete("mood");
      else params.set("mood", mood.toLowerCase());
      const next = params.toString();
      const current = window.location.search.replace(/^\?/, "");
      if (next === current) return;
      void navigate({
        to: slug ? "/poem/$slug" : "/",
        params: slug ? { slug } : undefined,
        search: Object.fromEntries(params.entries()),
        replace: false,
      });
    },
    [navigate, slug],
  );

  useLayoutEffect(() => {
    const params = new URLSearchParams(searchStr.startsWith("?") ? searchStr.slice(1) : searchStr);
    const raw = params.get("mood");
    const next = moodFromSearch(searchStr);
    if (raw && !MOODS.some((item) => item.toLowerCase() === raw.toLowerCase())) {
      writeMoodUrl("all");
    }
    if (next === moodRef.current && getSession().mood === next) return;
    moodRef.current = next;
    layoutForMood(next);
  }, [layoutForMood, searchStr, writeMoodUrl]);

  const dismissHint = useCallback(() => {
    setHint((current) => {
      if (current !== "show") return current;
      writeHintDismissed();
      return "hide";
    });
  }, []);

  const closeReader = useCallback(() => {
    const search = Object.fromEntries(new URLSearchParams(window.location.search));
    void navigate({ to: "/", search });
  }, [navigate]);

  const openById = useCallback(
    (id: string) => {
      const poem = getPoemById(id);
      if (!poem) return;
      rememberFocusPoem(id);
      dismissHint();
      setResultsOpen(false);
      setHelpOpen(false);
      const search = Object.fromEntries(new URLSearchParams(window.location.search));
      void navigate({ to: "/poem/$slug", params: { slug: poem.slug }, search });
    },
    [dismissHint, navigate],
  );

  const chooseMood = useCallback(
    (mood: Mood | "all") => {
      moodRef.current = mood;
      layoutForMood(mood);
      writeMoodUrl(mood);
    },
    [layoutForMood, writeMoodUrl],
  );

  const shuffle = useCallback(() => {
    const positions = shufflePositions(poems);
    savedPositions.current = positions;
    const mood = getSession().mood;
    moodRef.current = mood;
    if (mood === "all") {
      updateSession((current) => ({ ...current, positions }));
      const bounds = boundsOf(poems, positions, 16);
      if (bounds) settle(panKeepingZoom(bounds, viewportSize(), getSession().camera.zoom));
    } else {
      layoutForMood(mood);
    }
    note("Poems shuffled");
  }, [layoutForMood, note, settle, viewportSize]);

  const resetLayout = useCallback(() => {
    const positions = curatedPositions();
    savedPositions.current = null;
    updateSession((current) => ({ ...current, positions, mood: "all" }));
    moodRef.current = "all";
    settle(composedCamera(viewportSize()));
    writeMoodUrl("all");
    note("View restored");
  }, [note, settle, viewportSize, writeMoodUrl]);

  const recenter = useCallback(() => {
    const current = getSession();
    const list = poems.filter((poem) => poemMatchesMood(poem, current.mood));
    const bounds = boundsOf(list, current.positions, 16);
    if (!bounds) return;
    settle(
      frameCamera(bounds, viewportSize(), {
        maxZoom: 1.15,
        padTop: 132,
        padBottom: 100,
        padX: 28,
      }),
    );
    note("Notes fitted");
  }, [note, settle, viewportSize]);

  const zoomBy = useCallback(
    (direction: 1 | -1) => {
      const element = viewportRef.current;
      if (!element) return;
      const camera = getSession().camera;
      const factor = direction > 0 ? 1.12 : 1 / 1.12;
      settle(zoomAt(camera, element.clientWidth / 2, element.clientHeight / 2, camera.zoom * factor));
    },
    [settle],
  );

  const onCamera = useCallback((camera: Camera) => {
    updateSession((current) => ({ ...current, camera }));
  }, []);

  const onMovePaper = useCallback((id: string, x: number, y: number) => {
    const previous = getSession().positions[id];
    updateSession((current) => {
      const prior = current.positions[id];
      if (!prior) return current;
      return {
        ...current,
        positions: {
          ...current.positions,
          [id]: { ...prior, x, y },
        },
      };
    });
    const saved = savedPositions.current?.[id];
    if (previous && saved && savedPositions.current) {
      savedPositions.current = {
        ...savedPositions.current,
        [id]: { ...saved, x: saved.x + (x - previous.x), y: saved.y + (y - previous.y) },
      };
    }
  }, []);

  const pickSearch = useCallback(
    (poem: Poem) => {
      setResultsOpen(false);
      rememberFocusPoem(poem.id);
      dismissHint();
      const search = Object.fromEntries(new URLSearchParams(window.location.search));
      void navigate({ to: "/poem/$slug", params: { slug: poem.slug }, search });
    },
    [dismissHint, navigate],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "Escape") {
        if (helpOpen) {
          setHelpOpen(false);
          return;
        }
        if (resultsOpen) {
          setResultsOpen(false);
          return;
        }
        if (openPoem) closeReader();
        return;
      }
      if (helpOpen || openPoem || typing) return;
      if (event.key === "?") {
        event.preventDefault();
        setHelpOpen(true);
        return;
      }
      const step = event.shiftKey ? 96 : 56;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        updateSession((current) => ({
          ...current,
          camera: { ...current.camera, x: current.camera.x + step },
        }));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        updateSession((current) => ({
          ...current,
          camera: { ...current.camera, x: current.camera.x - step },
        }));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        updateSession((current) => ({
          ...current,
          camera: { ...current.camera, y: current.camera.y + step },
        }));
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        updateSession((current) => ({
          ...current,
          camera: { ...current.camera, y: current.camera.y - step },
        }));
      } else if (event.key === "Home") {
        event.preventDefault();
        recenter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeReader, helpOpen, openPoem, recenter, resultsOpen]);

  const goHome = () => {
    setHelpOpen(false);
    setResultsOpen(false);
    const positions = savedPositions.current ?? getSession().positions;
    savedPositions.current = null;
    moodRef.current = "all";
    updateSession((current) => ({ ...current, mood: "all", positions }));
    settle(composedCamera(viewportSize()));
    writeMoodUrl("all");
  };

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#wall"
        onClick={(event) => {
          event.preventDefault();
          viewportRef.current?.focus();
        }}
      >
        Skip to the wall
      </a>
      <a
        className="skip-link"
        href="#toolbar"
        onClick={(event) => {
          event.preventDefault();
          toolbarRef.current?.focus();
        }}
      >
        Skip to search and filters
      </a>
      <header className="toolbar" id="toolbar" tabIndex={-1} ref={toolbarRef}>
        <Link to="/" className="brand" onClick={goHome}>
          <span className="brand-mark" aria-hidden="true" />
          <h1>Paper Trail</h1>
        </Link>
        <PoemSearch
          query={query}
          results={results}
          matchCount={query.trim() ? matchCount : null}
          open={resultsOpen}
          inputRef={searchRef}
          onQueryChange={setQuery}
          onOpenChange={setResultsOpen}
          onPick={pickSearch}
        />
        <MoodFilter mood={session.mood} onChange={chooseMood} />
        <div className="actions">
          <Tip label="Shuffle notes">
            <button type="button" className="text-btn" aria-label="Shuffle notes" onClick={shuffle}>
              <Shuffle aria-hidden="true" strokeWidth={1.75} />
              <span className="btn-label">Shuffle</span>
            </button>
          </Tip>
          <Tip label="Restore layout">
            <button type="button" className="text-btn" aria-label="Restore layout" onClick={resetLayout}>
              <RotateCcw aria-hidden="true" strokeWidth={1.75} />
              <span className="btn-label">Restore</span>
            </button>
          </Tip>
          <Tip label="Help">
            <button
              ref={helpButtonRef}
              type="button"
              className="icon-btn"
              aria-label="Help"
              onClick={() => setHelpOpen(true)}
            >
              <CircleHelp aria-hidden="true" strokeWidth={1.75} />
            </button>
          </Tip>
        </div>
      </header>
      <WallCanvas
        poems={poems}
        positions={session.positions}
        camera={session.camera}
        shownIds={shownIds}
        matchIds={matchIds}
        selectedId={openPoem?.id ?? null}
        settling={settling}
        locked={helpOpen || !!openPoem}
        viewportRef={viewportRef}
        onCamera={onCamera}
        onMovePaper={onMovePaper}
        onOpen={openById}
        onPan={dismissHint}
      />
      {hint === "show" ? (
        <div className="hint" role="note">
          <p>Drag the space to explore. Select a note to read.</p>
          <button
            type="button"
            className="text-btn hint-dismiss"
            onClick={() => {
              writeHintDismissed();
              setHint("hide");
            }}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {liveStatus}
      </p>
      {actionNote ? (
        <p className="action-note" role="status">
          {actionNote}
        </p>
      ) : null}
      {session.mood !== "all" && visiblePoems.length === 0 ? (
        <QuietState
          title="Nothing in this mood"
          body={`No ${session.mood} poems yet. You can bring the full wall back.`}
          actionLabel="Show all"
          onAction={() => chooseMood("all")}
        />
      ) : null}
      {query.trim() && matchCount === 0 && visiblePoems.length > 0 ? (
        <QuietState
          title="No poems match"
          body="Nothing in this search fits the notes you are looking at. Clear the search to see them again."
          actionLabel="Clear search"
          onAction={() => {
            setQuery("");
            setResultsOpen(false);
            searchRef.current?.focus();
          }}
        />
      ) : null}
      <WallControls
        zoom={session.camera.zoom}
        onZoomIn={() => zoomBy(1)}
        onZoomOut={() => zoomBy(-1)}
        onRecenter={recenter}
      />
      <Nameplate />
      {openPoem ? <PoemReader poem={openPoem} onClose={closeReader} /> : null}
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
