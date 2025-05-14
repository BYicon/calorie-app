import { post } from "../utils/request";

export const aiChat = (data: {
    userId: string;
    message: string;
}) => {
  return post("/ai-chat", data);
};
