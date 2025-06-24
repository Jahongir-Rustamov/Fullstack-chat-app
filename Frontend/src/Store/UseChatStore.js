import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../library/axios";
import { useAuthStore } from "./UseAuthStore";
export const useChatStore = create((set, get) => ({
  user: [],
  messages: [],
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const response = await axiosInstance.get("/messages/users");
      console.log("Fetched users:", response.data);
      if (!response.data || response.data.length === 0) {
        toast.error("No users found");
      }
      set({ user: response.data.users, isUserLoading: false });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users", { id: "fetch-users-error" });
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: response.data, isMessagesLoading: false });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;

    if (!socket) {
      console.error("Socket is not initialized");
      return;
    }
    socket.on("newMessage", (message) => {
      const isMessageSentFromSelectedUser =
        message.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error("Socket is not initialized");
      return;
    }
    socket.off("newMessage");
  },

  setSelectedUser: async (selectedUser) => set({ selectedUser: selectedUser }),
}));
