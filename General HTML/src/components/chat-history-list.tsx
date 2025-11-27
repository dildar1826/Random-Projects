import type { DbChatHistory } from "@/lib/types";

type ChatHistoryListProps = {
  history: DbChatHistory[];
  onSelect?: (history: DbChatHistory) => void;
};

export function ChatHistoryList({
  history,
  onSelect,
}: ChatHistoryListProps) {
  if (!history.length) {
    return (
      <div className="text-sm text-[var(--text-secondary)]">
        No previous sessions yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {history.map((item) => {
        const archivedAt =
          item.saved_data?.archived_at &&
          new Date(item.saved_data.archived_at);
        const messageCount = item.saved_data?.messages?.length ?? 0;

        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onSelect?.(item)}
            className="w-full rounded-xl bg-[var(--background-tertiary)]/60 hover:bg-[var(--background-tertiary)] border border-white/5 p-3 text-left transition"
          >
            <div className="text-sm font-semibold text-white">
              Session {item.session_id.slice(0, 8)}
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              {archivedAt
                ? archivedAt.toLocaleString()
                : "No archive timestamp"}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              {messageCount} messages
            </div>
          </button>
        );
      })}
    </div>
  );
}

