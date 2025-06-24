import { useEffect, useRef } from "react";
import { useChatStore } from "../Store/UseChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeleton/MessageSkeleton";
import { useAuthStore } from "../Store/UseAuthStore";
import { formatMessageTime } from "../library/utilitis";

const ChatContainer = () => {
  const {
    selectedUser,
    messages,
    getMessages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  console.log("Auth User:", authUser);
  const messageEndRef = useRef(null);
  useEffect(() => {
    if (!selectedUser) return;
    console.log("Selected User:", selectedUser);
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(
          (message) => (
            console.log("Message:", message),
            (
              <div
                key={message._id}
                className={`chat ${
                  String(message.senderId._id || message.senderId) ===
                  String(authUser._id)
                    ? "chat-end"
                    : "chat-start"
                }`}
                ref={messageEndRef}
              >
                <div className=" chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        String(message.senderId._id || message.senderId) ===
                        authUser._id
                          ? authUser.profilePicture || "/avatar.png"
                          : selectedUser.profilePicture || "/avatar.png"
                      }
                      alt="profile picture"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            )
          )
        )}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
