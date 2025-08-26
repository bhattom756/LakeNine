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
    console.log('📜 Chat history API called');
    await connectDB();

    const { userId, userEmail } = req.query;

    // Validate required fields
    if (!userId && !userEmail) {
      return res.status(400).json({ 
        error: 'Either userId or userEmail is required' 
      });
    }

    // Build query
    const query: any = { isActive: true };
    if (userId) query.userId = userId;
    if (userEmail) query.userEmail = userEmail;

    console.log('🔍 Fetching chat history for:', query);

    // Fetch chat history (sorted by most recent first)
    const chatHistory = await ChatHistory.find(query)
      .sort({ updatedAt: -1 })
      .select('_id title createdAt updatedAt messages')
      .limit(50) // Limit to last 50 chats
      .lean(); // Convert to plain objects for better performance

    console.log(`✅ Found ${chatHistory.length} chat conversations`);

    // Transform data for frontend
    const formattedHistory = chatHistory.map(chat => ({
      id: chat._id.toString(),
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messageCount: chat.messages.length,
      lastMessage: chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1].content.substring(0, 100) + '...'
        : 'No messages',
      preview: chat.messages.find(msg => msg.role === 'user')?.content.substring(0, 60) + '...' || 'New Chat'
    }));

    res.status(200).json({
      success: true,
      chats: formattedHistory,
      total: chatHistory.length
    });

  } catch (error) {
    console.error('❌ Error fetching chat history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chat history',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 