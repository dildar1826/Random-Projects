export type DbSession = {
  id: string;
  date: string;
  start_time: string;
};

export type DbMessage = {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
  session_id: string;
  sender_username?: string | null;
};

export type SavedHistoryPayload = {
  session: DbSession;
  archived_at: string;
  messages: DbMessage[];
};

export type DbChatHistory = {
  id: string;
  session_id: string;
  saved_data: SavedHistoryPayload | null;
};

export type SessionUser = {
  id: string;
  username: string;
  isAdmin: boolean;
};

