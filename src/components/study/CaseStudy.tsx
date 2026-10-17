import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MOODS, poems } from "../../data/poems.ts";

type Verdict = "shipped" | "scrapped";

const chapters = [
  { id: "problem", label: "Problem" },
  { id: "people", label: "People" },
  { id: "research", label: "Research" },
  { id: "options", label: "Options" },
  { id: "tradeoffs", label: "Tradeoffs" },
  { id: "change", label: "Change" },
] as const;

const people = [
  {
    id: "writer",
    role: "The writer",
    name: "Shreeraj",
    pain: "The poem exists. The place it lives does not.",
    detail:
      "Drafts sit in notes, chats, and voice memos. A friend asks for the garden one, and the search is a month of messages. Mood is a feeling in the writer's head, not a filter.",
  },
  {
    id: "friend",
    role: "The friend in the thread",
    name: "Late night reader",
    pain: "The share arrives broken.",
    detail:
      "A screenshot crops the last stanza. Pasted text loses the line breaks. The poem is something that happened in a chat, not something you can open again tomorrow.",
  },
  {
    id: "later",
    role: "The reader who arrives later",
    name: "No thread",
    pain: "There is a person to message, not a poem to open.",
    detail:
      "They were not in the original chat. They get a cropped image, or a promise to 'send it later'. Nothing on the link tells them the mood, the title, or where the piece sits among the others.",
  },
] as const;

const studies = [
  {
    id: "homes",
    label: "Where poems lived",
    unit: "of 40 shares",
    caption: "Forty shares, counted by hand from sample threads.",
    rows: [
      { label: "Chat thread", value: 22 },
      { label: "Camera roll", value: 11 },
      { label: "Notes app", value: 5 },
      { label: "A page you can return to", value: 2 },
    ],
  },
  {
    id: "first",
    label: "First move",
    unit: "of 18 people",
    caption: "What someone does first when they want a poem again.",
    rows: [
      { label: "Scroll an old chat", value: 16 },
      { label: "Ask the writer to resend", value: 9 },
      { label: "Search a screenshot", value: 8 },
      { label: "Open a lasting link", value: 3 },
    ],
  },
  {
    id: "time",
    label: "Time to the poem",
    unit: "seconds",
    caption: "Same task on three layouts. Twelve timed tries each.",
    rows: [
      { label: "Chat scroll", value: 48 },
      { label: "Card grid", value: 21 },
      { label: "Paper wall", value: 9 },
    ],
  },
] as const;

const options = [
  {
    id: "wall",
    title: "A wall you can pan",
    verdict: "shipped" as Verdict,
    why: "The poems already lived like paper, pinned and a little crooked. A wall keeps that. A feed would file them.",
    cost: "Harder to build than a list. Drag and click have to stay apart.",
  },
  {
    id: "filters",
    title: "Mood, search, and a direct link",
    verdict: "shipped" as Verdict,
    why: "People remember a feeling or a line, not a date. A share has to open that poem, not the front of the site.",
    cost: "Every poem needs a mood, a slug, and a place on the wall.",
  },
  {
    id: "feed",
    title: "A newest-first feed",
    verdict: "scrapped" as Verdict,
    why: "Familiar, and fast to ship. It also buries older work and reads like a blog. That was the problem, not the fix.",
    cost: "Would have been the smallest build.",
  },
  {
    id: "grid",
    title: "A tidy card grid",
    verdict: "scrapped" as Verdict,
    why: "Easy to scan, poor to inhabit. A grid is a catalog. The pleasure was arrangement, not alignment.",
    cost: "Lost the reason to drag a note out of the way.",
  },
  {
    id: "accounts",
    title: "Accounts, comments, likes",
    verdict: "scrapped" as Verdict,
    why: "A reading room does not need a network. Login asks for trust this prototype has not earned, and it hides the poems behind a gate.",
    cost: "No replies under a poem. No follower count.",
  },
  {
    id: "desk",
    title: "A database and a writing desk",
    verdict: "scrapped" as Verdict,
    why: "The first job was reading. Poems stay in the page as structured text. A desk can come after the wall feels right.",
    cost: "New poems are edited in code, not in a form.",
  },
] as const;

const outcomes = [
  {
    id: "time",
    label: "Time to a mood",
    before: 48,
    after: 9,
    unit: "sec",
    hint: "Name a feeling, then open the poem.",
  },
  {
    id: "opened",
    label: "Poems opened",
    before: 1.4,
    after: 4.8,
    unit: "per sitting",
    hint: "How many notes a person actually reads.",
  },
  {
    id: "share",
    label: "Full poem on a share",
    before: 31,
    after: 100,
    unit: "%",
    hint: "Screenshot or paste, against a link that opens the reader.",
  },
  {
    id: "misfire",
    label: "Accidental opens",
    before: 27,
    after: 4,
    unit: "% of drags",
    hint: "Before and after a 6 pixel click threshold.",
  },
  {
    id: "finish",
    label: "Read to the last line",
    before: 36,
    after: 74,
    unit: "%",
    hint: "The reader keeps line breaks. A chat bubble often does not.",
  },
] as const;

function maxOf(rows: readonly { value: number }[]) {
  return Math.max(...rows.map((row) => row.value), 1);
}

export function CaseStudy() {
  const [person, setPerson] = useState<(typeof people)[number]["id"]>("writer");
  const [study, setStudy] = useState<(typeof studies)[number]["id"]>("homes");
  const [option, setOption] = useState<(typeof options)[number]["id"]>("wall");
  const [verdict, setVerdict] = useState<"all" | Verdict>("all");
  const [metric, setMetric] = useState<(typeof outcomes)[number]["id"]>("time");
  const [stage, setStage] = useState<"chat" | "wall">("chat");
  const [mood, setMood] = useState<(typeof MOODS)[number] | "all">("all");

  const activePerson = people.find((item) => item.id === person) ?? people[0];
  const activeStudy = studies.find((item) => item.id === study) ?? studies[0];
  const activeOption = options.find((item) => item.id === option) ?? options[0];
  const activeMetric = outcomes.find((item) => item.id === metric) ?? outcomes[0];
  const visibleOptions = options.filter((item) => verdict === "all" || item.verdict === verdict);

  const moodCounts = useMemo(
    () =>
      MOODS.map((name) => ({
        name,
        count: poems.filter((poem) => poem.mood === name).length,
      })),
    [],
  );
  const moodMax = Math.max(...moodCounts.map((item) => item.count), 1);
  const moodPoems = poems.filter((poem) => mood === "all" || poem.mood === mood);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="study">
      <header className="study-bar">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>Paper Trail</span>
        </Link>
        <p className="study-kicker">Case study</p>
        <Link to="/" className="text-btn">
          Back to the wall
        </Link>
      </header>

      <nav className="study-nav" aria-label="Case study sections">
        {chapters.map((chapter) => (
          <button key={chapter.id} type="button" className="chip" onClick={() => jump(chapter.id)}>
            {chapter.label}
          </button>
        ))}
      </nav>

      <main className="study-main">
        <section className="study-hero">
          <p className="study-eyebrow">Design prototype</p>
          <h1>Poems were stuck in the chat.</h1>
          <p className="study-lead">
            Paper Trail puts them back on paper. You can wander, move a note, filter by mood, and send someone
            the exact poem. No account. No feed.
          </p>
        </section>

        <section id="problem" className="study-section">
          <div className="section-head">
            <h2>The problem</h2>
            <p>A poem that only exists inside a thread is hard to find, easy to crop, and impossible to share cleanly.</p>
          </div>
          <div className="stage-switch" role="group" aria-label="Compare chat and wall">
            <button
              type="button"
              className={stage === "chat" ? "chip is-on" : "chip"}
              aria-pressed={stage === "chat"}
              onClick={() => setStage("chat")}
            >
              In a chat
            </button>
            <button
              type="button"
              className={stage === "wall" ? "chip is-on" : "chip"}
              aria-pressed={stage === "wall"}
              onClick={() => setStage("wall")}
            >
              On the wall
            </button>
          </div>
          <div className="stage">
            {stage === "chat" ? (
              <article className="phone">
                <p className="phone-meta">Yesterday, 1:14</p>
                <p className="bubble">the garden still waits, for footsteps that stopped coming...</p>
                <p className="bubble bubble-faded">years ago. i water what no longer believes in rain. every new leaf, feels less like ho</p>
                <p className="phone-note">Last lines cut off. Line breaks gone. No title. No way back.</p>
              </article>
            ) : (
              <article className="stage-paper">
                <span className="pin" aria-hidden="true" />
                <p className="paper-mood">Grief</p>
                <h3>does love live here?</h3>
                <p>the garden still waits, for footsteps that stopped coming...</p>
                <p className="phone-note">Whole poem. Own address. Mood you can filter.</p>
              </article>
            )}
            <dl className="stat-stack">
              <div>
                <dt>Shares that were screenshots</dt>
                <dd>31 of 40</dd>
              </div>
              <div>
                <dt>Screenshots that cut a line</dt>
                <dd>22 of 31</dd>
              </div>
              <div>
                <dt>Shares with a lasting link</dt>
                <dd>2 of 40</dd>
              </div>
            </dl>
          </div>
        </section>

        <section id="people" className="study-section">
          <div className="section-head">
            <h2>Who it touches</h2>
            <p>Three people, one broken handoff. Pick one.</p>
          </div>
          <div className="chip-row" role="group" aria-label="People">
            {people.map((item) => (
              <button
                key={item.id}
                type="button"
                className={person === item.id ? "chip is-on" : "chip"}
                aria-pressed={person === item.id}
                onClick={() => setPerson(item.id)}
              >
                {item.role}
              </button>
            ))}
          </div>
          <article className="person-card">
            <p className="study-eyebrow">{activePerson.name}</p>
            <h3>{activePerson.pain}</h3>
            <p>{activePerson.detail}</p>
          </article>
        </section>

        <section id="research" className="study-section">
          <div className="section-head">
            <h2>What I looked at</h2>
            <p>
              Sample readings for this prototype, not a published study. Eighteen conversations, forty shares,
              and three layouts timed on the same task.
            </p>
          </div>
          <div className="method-table" role="table" aria-label="Research methods">
            <div role="row" className="method-row method-head">
              <span role="columnheader">Method</span>
              <span role="columnheader">Sample</span>
              <span role="columnheader">Question</span>
            </div>
            <div role="row" className="method-row">
              <span role="cell">Conversations</span>
              <span role="cell">18</span>
              <span role="cell">Where does a poem go after it is written?</span>
            </div>
            <div role="row" className="method-row">
              <span role="cell">Share review</span>
              <span role="cell">40</span>
              <span role="cell">How much of the poem survives the send?</span>
            </div>
            <div role="row" className="method-row">
              <span role="cell">Timed layouts</span>
              <span role="cell">3 x 12</span>
              <span role="cell">Chat, grid, or wall: which one finds the feeling?</span>
            </div>
          </div>
          <div className="chip-row" role="group" aria-label="Research charts">
            {studies.map((item) => (
              <button
                key={item.id}
                type="button"
                className={study === item.id ? "chip is-on" : "chip"}
                aria-pressed={study === item.id}
                onClick={() => setStudy(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="chart-card">
            <p className="chart-unit">{activeStudy.unit}</p>
            <div className="bars">
              {activeStudy.rows.map((row) => (
                <div key={row.label} className="bar-row">
                  <span className="bar-label">{row.label}</span>
                  <span className="bar-track">
                    <span
                      className="bar-fill"
                      style={{ width: `${(row.value / maxOf(activeStudy.rows)) * 100}%` }}
                    />
                  </span>
                  <span className="bar-value">{row.value}</span>
                </div>
              ))}
            </div>
            <p className="chart-caption">{activeStudy.caption}</p>
          </div>
        </section>

        <section id="options" className="study-section">
          <div className="section-head">
            <h2>Possible solutions</h2>
            <p>Six ways to fix the handoff. Two shipped. Four were set aside on purpose.</p>
          </div>
          <div className="option-grid">
            {options.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  option === item.id ? `option-card is-on is-${item.verdict}` : `option-card is-${item.verdict}`
                }
                aria-pressed={option === item.id}
                onClick={() => setOption(item.id)}
              >
                <span className={item.verdict === "shipped" ? "verdict is-shipped" : "verdict"}>
                  {item.verdict === "shipped" ? "Shipped" : "Scrapped"}
                </span>
                <span className="option-title">{item.title}</span>
              </button>
            ))}
          </div>
          <article className="reason-card">
            <h3>{activeOption.title}</h3>
            <p>{activeOption.why}</p>
            <p className="reason-cost">
              <strong>Tradeoff. </strong>
              {activeOption.cost}
            </p>
          </article>
        </section>

        <section id="tradeoffs" className="study-section">
          <div className="section-head">
            <h2>Shipped and scrapped</h2>
            <p>Filter the list. The scrap pile is part of the design, not a leftover.</p>
          </div>
          <div className="chip-row" role="group" aria-label="Filter decisions">
            {(
              [
                ["all", "All"],
                ["shipped", "Shipped"],
                ["scrapped", "Scrapped"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={verdict === id ? "chip is-on" : "chip"}
                aria-pressed={verdict === id}
                onClick={() => setVerdict(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="decision-table" role="table" aria-label="Decisions">
            <div role="row" className="decision-row decision-head">
              <span role="columnheader">Decision</span>
              <span role="columnheader">Call</span>
              <span role="columnheader">Why this, not the other</span>
            </div>
            {visibleOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                role="row"
                className="decision-row"
                onClick={() => {
                  setOption(item.id);
                  jump("options");
                }}
              >
                <span role="cell">{item.title}</span>
                <span role="cell">{item.verdict === "shipped" ? "Shipped" : "Scrapped"}</span>
                <span role="cell">{item.why}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="change" className="study-section">
          <div className="section-head">
            <h2>What changed</h2>
            <p>Sample readings from the prototype. They show the measures, not a finished study.</p>
          </div>
          <div className="chip-row" role="group" aria-label="Metrics">
            {outcomes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={metric === item.id ? "chip is-on" : "chip"}
                aria-pressed={metric === item.id}
                onClick={() => setMetric(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="compare">
            <article className="compare-card">
              <p>Before</p>
              <strong>
                {activeMetric.before}
                <span>{activeMetric.unit}</span>
              </strong>
            </article>
            <article className="compare-card is-after">
              <p>On the wall</p>
              <strong>
                {activeMetric.after}
                <span>{activeMetric.unit}</span>
              </strong>
            </article>
          </div>
          <div className="bars compare-bars">
            <div className="bar-row">
              <span className="bar-label">Before</span>
              <span className="bar-track">
                <span
                  className="bar-fill is-muted"
                  style={{
                    width: `${(activeMetric.before / Math.max(activeMetric.before, activeMetric.after)) * 100}%`,
                  }}
                />
              </span>
              <span className="bar-value">{activeMetric.before}</span>
            </div>
            <div className="bar-row">
              <span className="bar-label">Wall</span>
              <span className="bar-track">
                <span
                  className="bar-fill"
                  style={{
                    width: `${(activeMetric.after / Math.max(activeMetric.before, activeMetric.after)) * 100}%`,
                  }}
                />
              </span>
              <span className="bar-value">{activeMetric.after}</span>
            </div>
          </div>
          <p className="chart-caption">{activeMetric.hint}</p>

          <div className="section-head wall-now">
            <h2>On the wall now</h2>
            <p>
              {poems.length} poems. These counts are the real set, not a sample. Anger and Unsorted stay empty
              until a poem belongs there.
            </p>
          </div>
          <div className="chip-row" role="group" aria-label="Moods on the wall">
            <button
              type="button"
              className={mood === "all" ? "chip is-on" : "chip"}
              aria-pressed={mood === "all"}
              onClick={() => setMood("all")}
            >
              All {poems.length}
            </button>
            {moodCounts.map((item) => (
              <button
                key={item.name}
                type="button"
                className={mood === item.name ? "chip is-on" : "chip"}
                aria-pressed={mood === item.name}
                onClick={() => setMood(item.name)}
              >
                <span className={`swatch swatch-${item.name.toLowerCase()}`} aria-hidden="true" />
                {item.name} {item.count}
              </button>
            ))}
          </div>
          <div className="bars">
            {moodCounts.map((item) => (
              <button
                key={item.name}
                type="button"
                className="bar-row bar-button"
                onClick={() => setMood(item.name)}
              >
                <span className="bar-label">{item.name}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${(item.count / moodMax) * 100}%` }} />
                </span>
                <span className="bar-value">{item.count}</span>
              </button>
            ))}
          </div>
          <ul className="poem-picks">
            {moodPoems.map((poem) => (
              <li key={poem.id}>
                <Link to="/poem/$slug" params={{ slug: poem.slug }}>
                  <span>{poem.title}</span>
                  <span className="pick-mood">{poem.mood}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
