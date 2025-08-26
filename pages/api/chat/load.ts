import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import ChatHistory from '@/models/ChatHistory';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📁 Chat load API called');
    await connectDB();

    const { chatId, userId } = req.query;

    // Validate required fields
    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    console.log('🔍 Loading chat:', chatId);

    // Build query - include userId for security if provided
    const query: any = { _id: chatId, isActive: true };
    if (userId) query.userId = userId;

    // Fetch specific chat with all messages
    const chat = await ChatHistory.findOne(query).lean();

    if (!chat) {
      console.log('❌ Chat not found:', chatId);
      return res.status(404).json({ error: 'Chat not found' });
    }

    console.log(`✅ Chat loaded with ${chat.messages.length} messages`);

    // Transform data for frontend
    const formattedChat = {
      id: chat._id.toString(),
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      userId: chat.userId,
      userEmail: chat.userEmail,
      userName: chat.userName,
      messages: chat.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }))
    };

    res.status(200).json({
      success: true,
      chat: formattedChat
    });

  } catch (error) {
    console.error('❌ Error loading chat:', error);
    res.status(500).json({ 
      error: 'Failed to load chat',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 