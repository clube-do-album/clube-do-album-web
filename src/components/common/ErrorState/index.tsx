type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-panel error-state" role="alert">
      <strong>{message}</strong>
      {onRetry && (
        <button className="button ghost" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
