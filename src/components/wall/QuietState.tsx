type Props = {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  layout?: "overlay" | "page";
};

export function QuietState({ title, body, actionLabel, onAction, layout = "overlay" }: Props) {
  const Heading = layout === "page" ? "h1" : "h2";
  return (
    <div className={layout === "page" ? "quiet-page" : "empty-overlay"} role="status">
      <div className="quiet-card">
        <Heading>{title}</Heading>
        <p>{body}</p>
        <button type="button" className="primary-btn" onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
