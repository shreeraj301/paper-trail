import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CircleHelp, RotateCcw, Shuffle } from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { getPoemById, getPoemBySlug, poems, type Mood, type Poem } from "../../data/poems.ts";
import {
  boundsOf,
  composedCamera,
  curatedPositions,
  frameCamera,
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
import { getSession, updateSession, useWallSession } from "../../lib/wall/session.ts";
import { HelpDialog } from "./HelpDialog.tsx";
import { MoodFilter } from "./MoodFilter.tsx";
import { Nameplate } from "./Nameplate.tsx";
import { PoemReader } from "./PoemReader.tsx";
import { PoemSearch } from "./PoemSearch.tsx";
import { QuietState } from "./QuietState.tsx";
import { WallCanvas } from "./WallCanvas.tsx";
import { WallControls } from "./WallControls.tsx";

function usePoemSlug(): string | null {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const match = pathname.match(/^\/poem\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function WallPage() {
  const session = useWallSession();
  const slug = usePoemSlug();
  const openPoem = slug ? getPoemBySlug(slug) : undefined;
  const navigate = useNavigate();
  const viewportRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const settleTimer = useRef(0);
  const helpWasOpen = useRef(false);
  const returnFocusId = useRef<string | null>(null);
  const [settling, setSettling] = useState(false);
  const [query, setQuery] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [hint, setHint] = useState<"unknown" | "show" | "hide">("unknown");

  const results = useMemo(() => searchPoems(poems, query), [query]);
  const visiblePoems = useMemo(
    () => poems.filter((poem) => poemMatchesMood(poem, session.mood)),
    [session.mood],
  );
  const shownIds = useMemo(() => {
    const ids = new Set(visiblePoems.map((poem) => poem.id));
    if (openPoem) ids.add(openPoem.id);
    return ids;
  }, [openPoem, visiblePoems]);

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
      returnFocusId.current = openPoem.id;
      return;
    }
    const id = returnFocusId.current;
    if (!id) return;
    document.getElementById(`paper-${id}`)?.focus();
  }, [openPoem]);

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

  const framePoems = useCallback(
    (list: Poem[], positions: Record<string, Position>, maxZoom = 1.05) => {
      const bounds = boundsOf(list, positions, 16);
      if (!bounds) return;
      settle(
        frameCamera(bounds, viewportSize(), {
          maxZoom,
          padTop: 124,
          padBottom: 100,
          padX: 28,
        }),
      );
    },
    [settle, viewportSize],
  );

  const dismissHint = useCallback(() => {
    setHint((current) => {
      if (current !== "show") return current;
      writeHintDismissed();
      return "hide";
    });
  }, []);

  const closeReader = useCallback(() => {
    void navigate({ to: "/" });
  }, [navigate]);

  const openById = useCallback(
    (id: string) => {
      const poem = getPoemById(id);
      if (!poem) return;
      dismissHint();
      setResultsOpen(false);
      setHelpOpen(false);
      void navigate({ to: "/poem/$slug", params: { slug: poem.slug } });
    },
    [dismissHint, navigate],
  );

  const chooseMood = useCallback(
    (mood: Mood | "all") => {
      const positions = getSession().positions;
      updateSession((current) => ({ ...current, mood }));
      framePoems(
        poems.filter((poem) => poemMatchesMood(poem, mood)),
        positions,
        mood === "all" ? 1.02 : 1.08,
      );
    },
    [framePoems],
  );

  const shuffle = useCallback(() => {
    const positions = shufflePositions(poems);
    updateSession((current) => ({ ...current, positions }));
    const mood = getSession().mood;
    framePoems(
      poems.filter((poem) => poemMatchesMood(poem, mood)),
      positions,
      1.02,
    );
  }, [framePoems]);

  const resetLayout = useCallback(() => {
    const positions = curatedPositions();
    updateSession((current) => ({ ...current, positions }));
    const mood = getSession().mood;
    if (mood === "all") {
      settle(composedCamera(viewportSize()));
      return;
    }
    framePoems(
      poems.filter((poem) => poem.mood === mood),
      positions,
      1.08,
    );
  }, [framePoems, settle, viewportSize]);

  const recenter = useCallback(() => {
    const current = getSession();
    framePoems(
      poems.filter((poem) => poemMatchesMood(poem, current.mood)),
      current.positions,
      1.02,
    );
  }, [framePoems]);

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
    updateSession((current) => {
      const previous = current.positions[id];
      if (!previous) return current;
      return {
        ...current,
        positions: {
          ...current.positions,
          [id]: { ...previous, x, y },
        },
      };
    });
  }, []);

  const pickSearch = useCallback(
    (poem: Poem) => {
      const positions = getSession().positions;
      setQuery("");
      setResultsOpen(false);
      updateSession((current) => ({ ...current, mood: "all" }));
      framePoems([poem], positions, 1.05);
      dismissHint();
      void navigate({ to: "/poem/$slug", params: { slug: poem.slug } });
    },
    [dismissHint, framePoems, navigate],
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
    settle(composedCamera(viewportSize()));
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#wall">
        Skip to the wall
      </a>
      <h1 className="sr-only">Paper Trail</h1>
      <WallCanvas
        poems={poems}
        positions={session.positions}
        camera={session.camera}
        shownIds={shownIds}
        selectedId={openPoem?.id ?? null}
        settling={settling}
        locked={helpOpen || !!openPoem}
        viewportRef={viewportRef}
        onCamera={onCamera}
        onMovePaper={onMovePaper}
        onOpen={openById}
        onPan={dismissHint}
      />
      <header className="toolbar" ref={toolbarRef}>
        <Link to="/" className="brand" onClick={goHome}>
          <span className="brand-mark" aria-hidden="true" />
          <span>Paper Trail</span>
        </Link>
        <PoemSearch
          query={query}
          results={results}
          open={resultsOpen}
          inputRef={searchRef}
          onQueryChange={setQuery}
          onOpenChange={setResultsOpen}
          onPick={pickSearch}
        />
        <MoodFilter mood={session.mood} onChange={chooseMood} />
        <div className="actions">
          <button type="button" className="text-btn" aria-label="Shuffle wall" onClick={shuffle}>
            <Shuffle aria-hidden="true" strokeWidth={1.75} />
            <span className="btn-label">Shuffle</span>
          </button>
          <button type="button" className="text-btn" aria-label="Reset layout" onClick={resetLayout}>
            <RotateCcw aria-hidden="true" strokeWidth={1.75} />
            <span className="btn-label">Reset</span>
          </button>
          <button
            ref={helpButtonRef}
            type="button"
            className="icon-btn"
            aria-label="Help"
            onClick={() => setHelpOpen(true)}
          >
            <CircleHelp aria-hidden="true" strokeWidth={1.75} />
          </button>
        </div>
      </header>
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
        {session.mood === "all" ? "Showing all poems" : `Showing ${session.mood} poems`}
      </p>
      {session.mood !== "all" && visiblePoems.length === 0 ? (
        <QuietState
          title="Nothing in this mood"
          body={`No poems are marked ${session.mood}. You can bring the full wall back.`}
          actionLabel="Show all"
          onAction={() => chooseMood("all")}
        />
      ) : null}
      <WallControls
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
