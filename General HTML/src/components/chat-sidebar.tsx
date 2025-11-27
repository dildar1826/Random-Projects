import { UserAvatar } from "@/components/user-avatar";
import { ChatHistoryList } from "@/components/chat-history-list";
import type { DbChatHistory } from "@/lib/types";

type ChatSidebarProps = {
  username: string;
  history: DbChatHistory[];
  onSelectHistory?: (history: DbChatHistory) => void;
  onLogout?: () => void;
};

export function ChatSidebar({
  username,
  history,
  onSelectHistory,
  onLogout,
}: ChatSidebarProps) {
  return (
    <aside className="w-full md:w-72 bg-[var(--background-secondary)] border-r border-white/5 flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <UserAvatar username={username} size="md" />
        <div>
          <div className="text-sm text-[var(--text-secondary)]">Logged in as</div>
          <div className="font-semibold text-white">{username}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3">
          Chat History
        </div>
        <ChatHistoryList history={history} onSelect={onSelectHistory} />
      </div>

      {onLogout && (
        <button
          onClick={onLogout}
          className="mt-auto w-full rounded-2xl bg-[var(--background-tertiary)] border border-white/5 py-3 text-sm text-[var(--text-secondary)] hover:text-white transition"
        >
          Logout
        </button>
      )}
    </aside>
  );
}

