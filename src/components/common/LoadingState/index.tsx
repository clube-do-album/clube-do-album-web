type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div className="state-panel" role="status">
      <span className="state-spinner" aria-hidden="true" />
      <strong>{message}</strong>
    </div>
  );
}
