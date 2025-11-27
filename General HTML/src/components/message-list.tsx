import type { DbMessage } from "@/lib/types";
import { UserAvatar } from "@/components/user-avatar";
import clsx from "clsx";

type MessageListProps = {
  messages: DbMessage[];
  currentUserId: string;
};

export function MessageList({ messages, currentUserId }: MessageListProps) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => {
        const isMe = message.sender_id === currentUserId;
        return (
          <div
            key={message.id}
            className={clsx("flex items-start gap-3", {
              "flex-row-reverse text-right": isMe,
            })}
          >
            <UserAvatar
              username={message.sender_username ?? "User"}
              size="sm"
            />
            <div
              className={clsx(
                "rounded-2xl px-4 py-2 max-w-[70%] shadow-lg border border-transparent",
                {
                  "bg-[var(--accent)] text-white": isMe,
                  "bg-[var(--background-tertiary)] text-white border-white/5":
                    !isMe,
                }
              )}
            >
              <div className="text-xs uppercase tracking-wide text-white/70 mb-1">
                {message.sender_username ?? "Unknown"}
              </div>
              <p className="text-sm leading-relaxed">{message.text}</p>
              <span className="text-[11px] text-white/60 block mt-1">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

