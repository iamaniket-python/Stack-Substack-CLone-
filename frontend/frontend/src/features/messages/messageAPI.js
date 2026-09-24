import axiosInstance from "../../api/axiosInstance";

export const getConversationsAPI = () =>
  axiosInstance.get("/messages/conversations");
export const getOrCreateConversationAPI = (userId) =>
  axiosInstance.post("/messages/conversations", { userId });
export const getMessagesAPI = (conversationId, page = 1) =>
  axiosInstance.get(
    `/messages/conversations/${conversationId}/messages?page=${page}`,
  );
export const searchUsersAPI = (q) =>
  axiosInstance.get(`/users/search?q=${encodeURIComponent(q)}`);
