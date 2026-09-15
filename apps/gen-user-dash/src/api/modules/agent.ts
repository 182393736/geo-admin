/** AGENT 新建对话 / 会话流 */
import { get, post } from '../http';

export type AgentChatMode = 'chat' | 'mining' | 'writing';

export type AgentChatMessage = {
  role: 'user' | 'assistant' | string;
  content: string;
  at?: string;
};

export type AgentChatSession = {
  session_id: string;
  brand_id?: string;
  kind: AgentChatMode | string;
  kind_label?: string;
  title: string;
  mode?: AgentChatMode | string;
  status?: string;
  status_label?: string;
  progress?: number;
  cost?: number;
  prompt?: string;
  messages?: AgentChatMessage[];
  platform?: string | null;
  query_id?: number | null;
  ended?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AgentChatListItem = {
  session_id: string;
  kind: string;
  kind_label: string;
  title: string;
  status?: string;
  ended?: boolean;
  updated_at?: string;
};

export const agentApi = {
  start: (p: {
    mode: AgentChatMode;
    prompt: string;
    platform?: string;
    query_id?: number | null;
    ref_links?: string[];
  }) => post<AgentChatSession>('/agent/chat/start', p),

  list: () => get<{ list: AgentChatListItem[] }>('/agent/chat/list'),

  detail: (session_id: string) => get<AgentChatSession>(`/agent/chat/${session_id}`),

  message: (session_id: string, content: string) =>
    post<AgentChatSession>(`/agent/chat/${session_id}/message`, { content }),

  end: (session_id: string) => post<AgentChatSession>(`/agent/chat/${session_id}/end`, {}),
};
