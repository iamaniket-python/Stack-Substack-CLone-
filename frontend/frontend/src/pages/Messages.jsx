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

const notifyUnreadChanged = () => window.dispatchEvent(new Event('messages:changed'));

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const startUserId = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [draftConv, setDraftConv] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);

  const active =
    conversations.find((c) => c.id === activeId) ||
    (draftConv?.id === activeId ? draftConv : null);

  const isChatOpen = Boolean(active);

  // Jo chat khuli hai uska unread badge dikhana nahi (wo padha ja raha hai)
  const listForDisplay = conversations.map((c) =>
    c.id === activeId ? { ...c, unread_count: 0 } : c
  );

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

  // Mobile keyboard fix: chat khula ho to visual viewport ki asli height/offset
  useEffect(() => {
    if (!isChatOpen) return;

    const vv = window.visualViewport;
    const root = document.documentElement;

    const update = () => {
      const height = vv ? vv.height : window.innerHeight;
      const top = vv ? vv.offsetTop : 0;
      root.style.setProperty('--vvh', `${height}px`);
      root.style.setProperty('--vvtop', `${top}px`);

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

  // Pehli baar list load
  useEffect(() => {
    loadConversations()
      .then(notifyUnreadChanged)
      .finally(() => setInitialLoading(false));
  }, [loadConversations]);

  // /messages?user=ID se aaye (author profile ka "Message" button)
  useEffect(() => {
    if (!startUserId) return;
    startConversationWith(startUserId).finally(() => {
      setSearchParams({}, { replace: true });
    });
  }, [startUserId, startConversationWith, setSearchParams]);

  // Naya message aaye to list refresh. Socket late ho to retry se listener lagta hai.
  useEffect(() => {
    const handler = async () => {
      await loadConversations();
      notifyUnreadChanged();
    };

    let attachedSocket = null;
    const attach = () => {
      const s = getSocket();
      if (s && s !== attachedSocket) {
        if (attachedSocket) attachedSocket.off('message:new', handler);
        s.on('message:new', handler);
        attachedSocket = s;
      }
    };

    attach();
    const retryTimer = setInterval(attach, 1500);

    return () => {
      clearInterval(retryTimer);
      if (attachedSocket) attachedSocket.off('message:new', handler);
    };
  }, [loadConversations]);

  // Chat kholne par messages backend par read mark hote hain: list aur navbar refresh karo
  useEffect(() => {
    if (!activeId) return;
    const t = setTimeout(async () => {
      await loadConversations();
      notifyUnreadChanged();
    }, 800);
    return () => clearTimeout(t);
  }, [activeId, loadConversations]);

  if (initialLoading) return <div className="feed-loading">Loading messages...</div>;

  return (
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
          conversations={listForDisplay}
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