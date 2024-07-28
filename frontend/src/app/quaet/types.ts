export interface ResultInfo {
  lines: number;
  finishReason: string;
  promptTokens: number;
  completionTokens: number;
}

export interface AddChatData {
  assistant_content: string;
  user_content: string;
}

export interface ChatCompletionData {
  system_content: string;
  user_content: string;
  add_chat_data: AddChatData[];
}

export interface ContentData {
  type: "user" | "assistant";
  value: string;
  color: string;
}
