export function ConversationListSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="w-full flex items-start gap-3 px-4 py-3.5 border-b border-border/40 animate-pulse"
        >
          <div className="mt-0.5 shrink-0 w-9 h-9 rounded-full bg-muted" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex justify-between">
              <div className="h-3.5 w-20 bg-muted rounded" />
              <div className="h-3 w-12 bg-muted rounded" />
            </div>
            <div className="h-3 w-28 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
