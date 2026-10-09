import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { Search, X } from "lucide-react";
import type { Poem } from "../../data/poems.ts";

type Props = {
  query: string;
  results: Poem[];
  open: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onPick: (poem: Poem) => void;
};

export function PoemSearch({
  query,
  results,
  open,
  inputRef,
  onQueryChange,
  onOpenChange,
  onPick,
}: Props) {
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const trimmed = query.trim();
  const showList = open && trimmed.length > 0;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!showList) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [onOpenChange, showList]);

  const pickIndex = (index: number) => {
    const poem = results[index];
    if (poem) onPick(poem);
  };

  return (
    <div className="search" ref={wrapRef}>
      <form
        role="search"
        className="search-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (results.length > 0) pickIndex(activeIndex);
        }}
      >
        <Search className="search-icon" aria-hidden="true" strokeWidth={1.75} />
        <label className="sr-only" htmlFor="poem-search">
          Search poems
        </label>
        <input
          id="poem-search"
          ref={inputRef}
          className="search-input"
          type="search"
          placeholder="Search poems"
          autoComplete="off"
          value={query}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList ? `${listId}-${activeIndex}` : undefined}
          onChange={(event) => {
            onQueryChange(event.target.value);
            onOpenChange(true);
          }}
          onFocus={() => onOpenChange(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              if (query) onQueryChange("");
              onOpenChange(false);
              return;
            }
            if (!showList) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => (results.length === 0 ? 0 : (index + 1) % results.length));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) =>
                results.length === 0 ? 0 : (index - 1 + results.length) % results.length,
              );
            }
          }}
        />
        {query ? (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onClick={() => {
              onQueryChange("");
              onOpenChange(false);
              inputRef.current?.focus();
            }}
          >
            <X aria-hidden="true" strokeWidth={1.75} />
          </button>
        ) : null}
      </form>
      {showList ? (
        <div className="search-results" id={listId} role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <div className="search-empty" role="status">
              <p>No poems found</p>
              <button type="button" className="text-btn" onClick={() => onQueryChange("")}>
                Clear search
              </button>
            </div>
          ) : (
            results.map((poem, index) => (
              <button
                key={poem.id}
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={index === activeIndex ? "search-result is-active" : "search-result"}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => onPick(poem)}
              >
                <span className="search-result-title">{poem.title}</span>
                <span className="search-result-mood">{poem.mood}</span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
