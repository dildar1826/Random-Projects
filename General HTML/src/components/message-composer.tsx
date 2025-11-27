import { SendHorizonal } from "lucide-react";
import { FormEvent, useState } from "react";

type MessageComposerProps = {
  onSend: (text: string) => Promise<void>;
  isSending: boolean;
};

export function MessageComposer({ onSend, isSending }: MessageComposerProps) {
  const [text, setText] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim() || isSending) {
      return;
    }
    await onSend(text.trim());
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 bg-[var(--background-secondary)] border-t border-white/5 px-6 py-4"
    >
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Send a message..."
        className="flex-1 bg-[var(--background-tertiary)] rounded-full px-5 py-3 text-sm text-white placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
      />
      <button
        type="submit"
        disabled={isSending || !text.trim()}
        className="flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-muted)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-full transition"
      >
        <SendHorizonal size={16} />
        Send
      </button>
    </form>
  );
}

