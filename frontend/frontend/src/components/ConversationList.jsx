const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

const ConversationList = ({ conversations, activeId, onSelect }) => {
  if (conversations.length === 0) {
    return <p className="conv-empty">No conversations yet</p>;
  }

  return (
    <div className="conv-list">
      {conversations.map((c) => (
        <div
          key={c.id}
          className={`conv-item ${activeId === c.id ? 'active' : ''}`}
          onClick={() => onSelect(c)}
        >
          <img src={c.other_user_avatar} alt={c.other_user_name} className="conv-avatar" />
          <div className="conv-item-body">
            <div className="conv-item-top">
              <span className="conv-name">{c.other_user_name}</span>
              <span className="conv-time">{timeAgo(c.last_message_at)}</span>
            </div>
            <div className="conv-item-bottom">
              <span className="conv-last-msg">{c.last_message || 'No messages yet'}</span>
              {c.unread_count > 0 && <span className="conv-unread-badge">{c.unread_count}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;