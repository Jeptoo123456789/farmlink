import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User as UserIcon, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { Conversation, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface MessagesPageProps {
  initialRecipientId?: string;
  initialProductId?: string;
  initialProductTitle?: string;
  initialText?: string;
  onBack?: () => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  initialRecipientId,
  initialProductId,
  initialProductTitle,
  initialText,
  onBack,
}) => {
  const { user, getAuthHeaders } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState(initialText || '');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of message thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations on mount
  useEffect(() => {
    let isMounted = true;

    async function initConversations() {
      if (!user) return;
      setIsLoading(true);

      try {
        // If an initial recipient was passed, start or retrieve the conversation first
        if (initialRecipientId) {
          const startRes = await fetch('/api/messages/conversations', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              recipient_id: initialRecipientId,
              product_id: initialProductId,
              initial_message: initialText,
            }),
          });

          if (startRes.ok) {
            const startData = await startRes.json();
            if (isMounted && startData.conversation) {
              setActiveConversationId(startData.conversation.id);
            }
          }
        }

        const res = await fetch('/api/messages/conversations', {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setConversations(data.conversations || []);
            // If active conversation not set, select first
            if (!activeConversationId && data.conversations?.length > 0 && !initialRecipientId) {
              setActiveConversationId(data.conversations[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initConversations();

    return () => {
      isMounted = false;
    };
  }, [user, initialRecipientId, initialProductId, initialText, getAuthHeaders]);

  // Load active conversation messages and poll every 4 seconds for real-time live messages
  useEffect(() => {
    if (!activeConversationId) return;

    let isMounted = true;

    async function fetchMessages() {
      try {
        const res = await fetch(`/api/messages/conversations/${activeConversationId}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setMessages(data.messages || []);
          }
        }
      } catch (err) {
        console.error('Error polling messages:', err);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 3500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeConversationId, getAuthHeaders]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || !textInput.trim()) return;

    const messageText = textInput.trim();
    setTextInput('');
    setIsSending(true);

    try {
      const res = await fetch(`/api/messages/conversations/${activeConversationId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: messageText }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();

        // Refresh conversation list to bump last message snippet
        const convsRes = await fetch('/api/messages/conversations', { headers: getAuthHeaders() });
        if (convsRes.ok) {
          const convData = await convsRes.json();
          setConversations(convData.conversations || []);
        }
      } else {
        showToast(data.error || 'Failed to send message.', 'error');
      }
    } catch (err) {
      showToast('Network error sending message.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const otherPartyName = activeConv
    ? user?.role === 'buyer'
      ? activeConv.seller_name
      : activeConv.buyer_name
    : 'Farmer / Buyer';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-display">
              Direct Farmer Messages
            </h1>
            <p className="text-xs text-stone-500">
              Direct coordination with agricultural growers regarding harvest specs, quantities, and logistics.
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Chat Layout */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 min-h-[580px] h-[65vh]">
        {/* Left Sidebar: Conversations List */}
        <div className="md:col-span-4 border-r border-stone-200 flex flex-col bg-stone-50/50">
          <div className="p-4 border-b border-stone-200 bg-white">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Conversations ({conversations.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-stone-200/60 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="font-semibold text-stone-700">No active conversations</p>
                <p className="text-stone-400">
                  Select "Contact Farmer" on any produce listing or order to initiate direct communication.
                </p>
              </div>
            ) : (
              conversations.map(conv => {
                const partnerName = user?.role === 'buyer' ? conv.seller_name : conv.buyer_name;
                const hasUnread = user && conv.unread_by?.includes(user.id);
                const isSelected = conv.id === activeConversationId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white border-l-4 border-emerald-800 shadow-xs'
                        : 'hover:bg-stone-100/70'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                      {partnerName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs truncate ${hasUnread ? 'font-bold text-stone-900' : 'font-semibold text-stone-800'}`}>
                          {partnerName}
                        </span>
                        <span className="text-[10px] text-stone-400 tabular-nums">
                          {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {conv.product_title && (
                        <p className="text-[10px] text-emerald-800 font-medium truncate mt-0.5">
                          Re: {conv.product_title}
                        </p>
                      )}

                      <p className={`text-xs truncate mt-0.5 ${hasUnread ? 'font-semibold text-stone-900' : 'text-stone-500'}`}>
                        {conv.last_message}
                      </p>
                    </div>

                    {hasUnread && (
                      <span className="w-2 h-2 rounded-full bg-emerald-700 shrink-0 self-center" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Message Thread */}
        <div className="md:col-span-8 flex flex-col bg-white">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {otherPartyName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-900">{otherPartyName}</h3>
                    {activeConv.product_title && (
                      <p className="text-[11px] text-stone-500">
                        Listing inquiry: <span className="font-medium text-emerald-800">{activeConv.product_title}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Real-time channel active</span>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-xs text-stone-400">
                    <p>No messages in this conversation yet. Send a greeting below!</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === user?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-emerald-800 text-white rounded-br-none shadow-xs'
                              : 'bg-stone-100 text-stone-900 rounded-bl-none border border-stone-200/80'
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-stone-400 mt-1 px-1 tabular-nums">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-stone-200 bg-stone-50/60 flex items-center gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="Type message regarding harvest, delivery time, packaging..."
                  className="flex-1 px-4 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-emerald-600 shadow-xs"
                />
                <button
                  type="submit"
                  disabled={isSending || !textInput.trim()}
                  className="p-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 text-stone-400 text-xs">
              <MessageSquare className="w-10 h-10 text-stone-300" />
              <p className="font-semibold text-stone-700">Select a conversation</p>
              <p>Choose an existing thread on the left or contact a farmer directly from any produce listing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
