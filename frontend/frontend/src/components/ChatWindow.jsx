import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getMessagesAPI } from "../features/messages/messageAPI";
import { getSocket } from "../socket/socketClient";
import { ArrowLeft, Send, Smile, Check, CheckCheck } from "lucide-react";

const ChatWindow = ({ conversation, onBack }) => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!conversation) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const { data } = await getMessagesAPI(conversation.id);
        setMessages(data.data.messages);
      } catch {
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    const socket = getSocket();
    if (!socket) return;

    socket.emit("conversation:join", conversation.id);

    const handleNewMessage = (message) => {
      if (message.conversation_id === conversation.id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleTyping = ({ conversationId, userId, isTyping }) => {
      if (conversationId === conversation.id && userId !== user.id) {
        setOtherTyping(isTyping);
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("typing", handleTyping);
    };
  }, [conversation, user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTypingChange = (value) => {
    setInput(value);
    const socket = getSocket();
    if (!socket) return;

    socket.emit("typing", { conversationId: conversation.id, isTyping: true });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        conversationId: conversation.id,
        isTyping: false,
      });
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const socket = getSocket();
    if (!socket) {
      toast.error("Not connected — try refreshing");
      return;
    }

    socket.emit(
      "message:send",
      { conversationId: conversation.id, content: input },
      (res) => {
        if (!res.success) toast.error(res.message || "Failed to send message");
      },
    );

    setInput("");
    socket.emit("typing", { conversationId: conversation.id, isTyping: false });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <div className="chat-empty-state">
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img
          src={conversation.other_user_avatar}
          alt=""
          className="chat-header-avatar"
        />
        <span>{conversation.other_user_name}</span>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">Loading...</div>
        ) : (
          <>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-bubble-row ${m.sender_id === user.id ? "own" : ""}`}
              >
                <div className="chat-bubble">{m.content}</div>
              </div>
            ))}
            {otherTyping && (
              <div className="chat-bubble-row">
                <div className="chat-bubble chat-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="chat-input-row">
        <input
          value={input}
          onChange={(e) => handleTypingChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <button
          type="button"
          className="icon-btn chat-back-btn"
          onClick={onBack}
          aria-label="Wapas"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
