import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SquarePen } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getConversationsAPI,
  getOrCreateConversationAPI,
} from '../features/messages/messageAPI';
import { getSocket } from '../socket/socketClient';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import NewMessageModal from '../components/NewMessageModal';
import '../styles/messages.css';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const startUserId = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  // Poora object nahi, sirf id: list reload hone par active chat ka data apne aap fresh rahta hai
  const [activeId, setActiveId] = useState(null);
  // Nayi conversation jo abhi list mein nahi aayi (0 messages), uske liye temporary object
  const [draftConv, setDraftConv] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);

  const active =
    conversations.find((c) => c.id === activeId) ||
    (draftConv?.id === activeId ? draftConv : null);

  const isChatOpen = Boolean(active);

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await getConversationsAPI();
      const list = data.data.conversations;
      setConversations(list);
      return list;
    } catch {
      toast.error('Failed to load conversations');
      return [];
    }
  }, []);

  const startConversationWith = useCallback(
    async (userId) => {
      try {
        const { data } = await getOrCreateConversationAPI(userId);
        const conv = data.data.conversation;
        const list = await loadConversations();
        if (!list.some((c) => c.id === conv.id)) {
          setDraftConv({ ...conv, other_user_id: userId });
        }
        setActiveId(conv.id);
        setShowNewMsgModal(false);
      } catch {
        toast.error('Could not start conversation');
      }
    },
    [loadConversations]
  );

  // Mobile keyboard fix: chat khula ho to page scroll lock + visual viewport ki asli height/offset
  // CSS variables mein daalo (keyboard khulne par bhi input aur header screen ke andar rahein)
  useEffect(() => {
    if (!isChatOpen) return;

    const vv = window.visualViewport;
    const root = document.documentElement;

    const update = () => {
      const height = vv ? vv.height : window.innerHeight;
      const top = vv ? vv.offsetTop : 0;
      root.style.setProperty('--vvh', `${height}px`);
      root.style.setProperty('--vvtop', `${top}px`);

      // Keyboard ke saath latest message hamesha dikhe
      const list = document.querySelector('.chat-messages');
      if (list) list.scrollTop = list.scrollHeight;
    };

    document.body.classList.add('chat-open');
    update();

    if (vv) {
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update);
    }
    window.addEventListener('resize', update);

    return () => {
      document.body.classList.remove('chat-open');
      root.style.removeProperty('--vvh');
      root.style.removeProperty('--vvtop');
      if (vv) {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      }
      window.removeEventListener('resize', update);
    };
  }, [isChatOpen]);

  // Pehli baar list load: loader sirf yahin dikhta hai
  useEffect(() => {
    loadConversations().finally(() => setInitialLoading(false));
  }, [loadConversations]);

  // /messages?user=ID se aaye (jaise author profile ka "Message" button)
  useEffect(() => {
    if (!startUserId) return;
    startConversationWith(startUserId).finally(() => {
      // URL saaf karo: warna refresh par ya back dabane par chat dobara khul jayegi
      setSearchParams({}, { replace: true });
    });
  }, [startUserId, startConversationWith, setSearchParams]);

  // Naya message aaye to list refresh (unread badge + last message)
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => loadConversations();
    socket.on('message:new', handler);
    return () => socket.off('message:new', handler);
  }, [loadConversations]);

  if (initialLoading) return <div className="feed-loading">Loading messages...</div>;

  return (
    // has-active: mobile par list chhupa kar chat dikhata hai (CSS mein)
    <div className={`messages-page ${isChatOpen ? 'has-active' : ''}`}>
      <div className="messages-sidebar">
        <div className="messages-sidebar-header">
          <h2>Messages</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowNewMsgModal(true)}
            aria-label="Naya message"
          >
            <SquarePen size={18} />
          </button>
        </div>
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={(conv) => setActiveId(conv.id)}
        />
      </div>

      <ChatWindow
        conversation={active}
        onBack={() => setActiveId(null)}
      />

      {showNewMsgModal && (
        <NewMessageModal
          onClose={() => setShowNewMsgModal(false)}
          onSelectUser={startConversationWith}
        />
      )}
    </div>
  );
};

export default Messages;