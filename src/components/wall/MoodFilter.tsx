import { MOODS, type Mood } from "../../data/poems.ts";

type Props = {
  mood: Mood | "all";
  onChange: (mood: Mood | "all") => void;
};

export function MoodFilter({ mood, onChange }: Props) {
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
      {MOODS.map((item) => (
        <button
          key={item}
          type="button"
          className="chip"
          aria-pressed={mood === item}
          onClick={() => onChange(item)}
        >
          <span className={`swatch swatch-${item.toLowerCase()}`} aria-hidden="true" />
          {item}
        </button>
      ))}
    </div>
  );
}
