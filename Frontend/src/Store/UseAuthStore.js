import { create } from "zustand";
import axiosInstance from "../library/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdateProfile: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      if (res.data?.user) {
        set({ authUser: res.data.user, isCheckingAuth: false });
      } else {
        set({ authUser: null, isCheckingAuth: false });
      }
      get().ConnectToSocket();
    } catch (error) {
      console.error("Error checking authentication:", error);
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const response = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: response.data });
      toast.success("Account created successfully 🎉");
      get().ConnectToSocket();
    } catch (error) {
      console.error("Error signing up:", error);
      set({ isSigningUp: false });
      toast.error(error.response.data.message, { id: "toast" });
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const response = await axiosInstance.post("/auth/login", formData);
      set({ authUser: response.data.user, isLoggingIn: false });
      toast.success("Logged in successfully 🎉");
      get().ConnectToSocket();
    } catch (error) {
      console.error("Error logging in:", error);
      set({ isLoggingIn: false });
      toast.error(error.response.data.message, { id: "toast12" });
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.delete("/auth/logout");
      set({ authUser: null, isCheckingAuth: false });
      toast.success(res.data.message);

      get().DisConnectToSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (ProfilePic) => {
    set({ isUpdateProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update", { ProfilePic });
      set({ authUser: res.data, isUpdateProfile: false });
      toast.success("Profile updated successfully 🎉");
    } catch (error) {
      set({ isUpdateProfile: false });
      toast.error(error.response.data.message);
    }
  },

  ConnectToSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(SOCKET_URL, {
      query: {
        userId: authUser._id,
      },
    });

    socket.connect();

    socket.on("getUserOnline", (users) => {
      console.log("Online users:", users);
      set({ onlineUsers: users });
    });

    set({ socket: socket });
  },

  DisConnectToSocket: () => {
    if (get().socket?.connected) return get().socket?.disconnect();
  },
}));
