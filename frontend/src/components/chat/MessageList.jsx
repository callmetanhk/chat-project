export const MessageList = ({ messages, user, bottomRef, chatPartnerName }) => (
  <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50/40 custom-scrollbar">
    {messages.map((msg, i) => {
      const senderUsername = typeof msg.sender === 'object' ? msg.sender.username : msg.sender;
      return (
        <ChatMessage 
          key={msg.id || i} 
          msg={msg} 
          isMe={senderUsername === user.username}
          currentUser={user}
          chatPartnerName={chatPartnerName}
        />
      );
    })}
    <div ref={bottomRef} />
  </div>
);