type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="state-panel">
      <strong>{title}</strong>
      {description && <p className="muted-text">{description}</p>}
    </div>
  );
}
