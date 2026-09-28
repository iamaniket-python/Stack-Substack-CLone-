import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getMessagesAPI } from "../features/messages/messageAPI";
import { getSocket } from "../socket/socketClient";
import { ArrowLeft, Send } from "lucide-react";

// Backend (messageHandler) ki limit se match karni hai, abhi andaza hai
const MAX_MESSAGE_LENGTH = 2000;

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, otherTyping]);

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
    const text = input.trim();
    if (!text) return;
    if (text.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message max ${MAX_MESSAGE_LENGTH} characters ka ho sakta hai`);
      return;
    }

    const socket = getSocket();
    if (!socket) {
      toast.error("Not connected — try refreshing");
      return;
    }

    socket.emit(
      "message:send",
      { conversationId: conversation.id, content: text },
      (res) => {
        if (!res?.success) {
          toast.error(res?.message || "Failed to send message");
          // Fail hua to likha hua text wapas: input abhi khali hai to hi restore
          setInput((current) => current || text);
        }
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
        {/* Back button header mein (sirf mobile par dikhta hai, CSS se) */}
        <button
          type="button"
          className="icon-btn chat-back-btn"
          onClick={onBack}
          aria-label="Wapas"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        {/* Naam bagal mein hai, isliye avatar decorative (alt="") */}
        <img
          src={conversation.other_user_avatar}
          alt=""
          className="chat-header-avatar"
        />
        <span>{conversation.other_user_name}</span>
      </div>

      <div
        className="chat-messages"
        role="log"
        aria-label={`${conversation.other_user_name} ke saath baatcheet`}
      >
        {loading ? (
          <div className="chat-loading" role="status">
            Loading...
          </div>
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
                <div
                  className="chat-bubble chat-typing"
                  role="status"
                  aria-label={`${conversation.other_user_name} type kar raha hai`}
                >
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
          aria-label="Message likho"
          maxLength={MAX_MESSAGE_LENGTH}
        />
        {/* Send button input row mein */}
        <button
          type="button"
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;