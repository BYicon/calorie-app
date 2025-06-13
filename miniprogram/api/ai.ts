import { EnumAiChatType } from "../enum/index";
import { post } from "../shared/request";

export const aiChat = (data: {
    userId?: string;
    message: string;
    type?: EnumAiChatType;
}) => {
  return post("/ai-chat", data);
};
