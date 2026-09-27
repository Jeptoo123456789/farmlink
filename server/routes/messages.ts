import { Router } from 'express';
import { getDatabase, saveDatabase, Conversation, Message } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET all conversations for current user
router.get('/conversations', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const db = getDatabase();
    const userId = req.user!.id;

    const userConvs = db.conversations.filter(
      c => c.buyer_id === userId || c.seller_id === userId
    );

    userConvs.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

    return res.json({ conversations: userConvs });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
});

// POST start or get existing conversation
router.post('/conversations', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { recipient_id, product_id, initial_message } = req.body;

    if (!recipient_id) {
      return res.status(400).json({ error: 'Recipient ID is required.' });
    }

    if (recipient_id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot start a conversation with yourself.' });
    }

    const db = getDatabase();
    const recipient = db.users.find(u => u.id === recipient_id);

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient user not found.' });
    }

    const buyerId = req.user!.role === 'buyer' ? req.user!.id : recipient_id;
    const sellerId = req.user!.role === 'seller' ? req.user!.id : recipient_id;

    const buyerUser = db.users.find(u => u.id === buyerId);
    const sellerUser = db.users.find(u => u.id === sellerId);

    // Look for existing conversation between these two
    let conversation = db.conversations.find(
      c => c.buyer_id === buyerId && c.seller_id === sellerId
    );

    const timestamp = new Date().toISOString();

    if (!conversation) {
      let productTitle: string | undefined;
      if (product_id) {
        const prod = db.products.find(p => p.id === product_id);
        if (prod) productTitle = prod.title;
      }

      conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        buyer_id: buyerId,
        buyer_name: buyerUser ? buyerUser.name : 'Buyer',
        seller_id: sellerId,
        seller_name: sellerUser ? sellerUser.name : 'Seller',
        product_id: product_id || undefined,
        product_title: productTitle,
        last_message: initial_message || 'Conversation initiated',
        last_message_at: timestamp,
        unread_by: initial_message ? [recipient_id] : [],
        created_at: timestamp,
      };

      db.conversations.unshift(conversation);
    }

    if (initial_message && String(initial_message).trim()) {
      const msg: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        conversation_id: conversation.id,
        sender_id: req.user!.id,
        sender_name: req.user!.name,
        receiver_id: recipient_id,
        text: String(initial_message).trim(),
        created_at: timestamp,
      };
      db.messages.push(msg);
      conversation.last_message = msg.text;
      conversation.last_message_at = timestamp;
      if (!conversation.unread_by.includes(recipient_id)) {
        conversation.unread_by.push(recipient_id);
      }
    }

    saveDatabase();

    return res.status(201).json({ conversation });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to initiate conversation.' });
  }
});

// GET messages in a conversation
router.get('/conversations/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const conversation = db.conversations.find(c => c.id === id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    if (conversation.buyer_id !== req.user!.id && conversation.seller_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Mark as read for this user
    conversation.unread_by = conversation.unread_by.filter(uid => uid !== req.user!.id);
    saveDatabase();

    const messages = db.messages
      .filter(m => m.conversation_id === id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return res.json({
      conversation,
      messages,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to load messages.' });
  }
});

// POST send a message in a conversation
router.post('/conversations/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Message text cannot be empty.' });
    }

    const db = getDatabase();
    const conversation = db.conversations.find(c => c.id === id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    if (conversation.buyer_id !== req.user!.id && conversation.seller_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const receiverId = conversation.buyer_id === req.user!.id ? conversation.seller_id : conversation.buyer_id;
    const timestamp = new Date().toISOString();

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversation_id: id,
      sender_id: req.user!.id,
      sender_name: req.user!.name,
      receiver_id: receiverId,
      text: String(text).trim(),
      created_at: timestamp,
    };

    db.messages.push(newMessage);
    conversation.last_message = newMessage.text;
    conversation.last_message_at = timestamp;

    if (!conversation.unread_by.includes(receiverId)) {
      conversation.unread_by.push(receiverId);
    }

    saveDatabase();

    return res.status(201).json({ message: newMessage });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to send message.' });
  }
});

export default router;
