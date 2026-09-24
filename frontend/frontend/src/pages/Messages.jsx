import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const startUserId = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);

  const loadConversations = async () => {
    try {
      const { data } = await getConversationsAPI();
      setConversations(data.data.conversations);
      return data.data.conversations;
    } catch {
      toast.error('Failed to load conversations');
      return [];
    }
  };

  const startConversationWith = async (userId) => {
    try {
      const { data } = await getOrCreateConversationAPI(userId);
      const conv = data.data.conversation;
      const list = await loadConversations();
      const existing = list.find((c) => c.id === conv.id);
      setActive(existing || { ...conv, other_user_id: userId });
      setShowNewMsgModal(false);
    } catch {
      toast.error('Could not start conversation');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadConversations();
      if (startUserId) await startConversationWith(startUserId);
      setLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startUserId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => loadConversations();
    socket.on('message:new', handler);
    return () => socket.off('message:new', handler);
  }, []);

  if (loading) return <div className="feed-loading">Loading messages...</div>;

  return (
    <div className="messages-page">
      <div className="messages-sidebar">
        <div className="messages-sidebar-header">
          <h2>Messages</h2>
          <button className="new-msg-btn" onClick={() => setShowNewMsgModal(true)}>
            ✎
          </button>
        </div>
        <ConversationList conversations={conversations} activeId={active?.id} onSelect={setActive} />
      </div>

      <ChatWindow conversation={active} />

      {showNewMsgModal && (
        <NewMessageModal onClose={() => setShowNewMsgModal(false)} onSelectUser={startConversationWith} />
      )}
    </div>
  );
};

export default Messages;