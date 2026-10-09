import { memo, type CSSProperties, type PointerEvent } from "react";
import type { Poem } from "../../data/poems.ts";
import { paperSize, type Position } from "../../lib/wall/geometry.ts";

type Props = {
  poem: Poem;
  position: Position;
  shown: boolean;
  selected: boolean;
  dragging: boolean;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>, poemId: string) => void;
  onClick: (poemId: string) => void;
};

function PaperPoemInner({
  poem,
  position,
  shown,
  selected,
  dragging,
  onPointerDown,
  onClick,
}: Props) {
  const size = paperSize(poem);
  const style = {
    width: size.w,
    height: size.h,
    left: position.x,
    top: position.y,
    "--rot": `${position.rotation}deg`,
    "--paper": `var(--paper-${poem.paperColor})`,
  } as CSSProperties;

  return (
    <button
      id={`paper-${poem.id}`}
      type="button"
      className={[
        "paper",
        selected ? "is-selected" : "",
        dragging ? "is-dragging" : "",
        shown ? "" : "is-hidden",
      ]
        .filter(Boolean)
        .join(" ")}
      data-variant={poem.paperType}
      data-mood={poem.mood}
      data-testid={`paper-${poem.id}`}
      aria-pressed={selected}
      aria-hidden={shown ? undefined : true}
      aria-label={
        poem.altText
          ? `${poem.title}, ${poem.mood}. ${poem.altText}`
          : `${poem.title}, ${poem.mood} poem`
      }
      tabIndex={shown ? 0 : -1}
      style={style}
      onPointerDown={(event) => onPointerDown(event, poem.id)}
      onClick={() => onClick(poem.id)}
    >
      <span className="paper-mood">{poem.mood}</span>
      <span className="paper-title">{poem.title}</span>
      {poem.excerpt ? <span className="paper-excerpt">{poem.excerpt}</span> : null}
    </button>
  );
}

export const PaperPoem = memo(PaperPoemInner);
