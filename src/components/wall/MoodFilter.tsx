import { MOODS, poems, type Mood } from "../../data/poems.ts";

type Props = {
  mood: Mood | "all";
  onChange: (mood: Mood | "all") => void;
};

function countLabel(count: number): string {
  return count === 1 ? "1 poem" : `${count} poems`;
}

export function MoodFilter({ mood, onChange }: Props) {
  const counts = new Map<Mood, number>(MOODS.map((item) => [item, 0]));
  for (const poem of poems) counts.set(poem.mood, (counts.get(poem.mood) ?? 0) + 1);

  return (
    <div className="moods" role="group" aria-label="Filter by mood">
      <button
        type="button"
        className="chip"
        aria-pressed={mood === "all"}
        onClick={() => onChange("all")}
      >
        All poems
      </button>
      {MOODS.map((item) => {
        const count = counts.get(item) ?? 0;
        return (
          <button
            key={item}
            type="button"
            className={count === 0 ? "chip is-empty" : "chip"}
            aria-pressed={mood === item}
            aria-label={`${item}, ${countLabel(count)}`}
            onClick={() => onChange(item)}
          >
            <span className={`swatch swatch-${item.toLowerCase()}`} aria-hidden="true" />
            {item} {count}
          </button>
        );
      })}
    </div>
  );
}
