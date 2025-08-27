import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import ChatHistory, { IChatHistory, IMessage, IProjectState, IGeneratedFile } from '@/models/ChatHistory';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('💾 Chat save API called');
    await connectDB();

    const { 
      userId, 
      userEmail, 
      userName, 
      messages, 
      chatId, // Optional - for updating existing chat
      projectState // Optional - generated files and project state
    } = req.body;

    // Validate required fields
    if (!userId || !userEmail || !messages || !Array.isArray(messages)) {
      console.error('❌ Missing required fields:', { userId, userEmail, messages: !!messages });
      return res.status(400).json({ 
        error: 'Missing required fields: userId, userEmail, messages' 
      });
    }

    // Process project state if provided
    let processedProjectState: IProjectState | undefined;
    if (projectState) {
      console.log('📁 Processing project state with', projectState.files?.length || 0, 'files');
      
      processedProjectState = {
        files: (projectState.files || []).map((file: any): IGeneratedFile => ({
          fileName: file.fileName || '',
          filePath: file.filePath || '',
          content: file.content || '',
          size: file.content ? file.content.length : 0,
          lastModified: new Date()
        })),
        fileStructure: projectState.fileStructure || {},
        previewUrl: projectState.previewUrl,
        projectType: projectState.projectType || 'react',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Generate title from first user message (max 50 chars)
    const firstUserMessage = messages.find((msg: IMessage) => msg.role === 'user');
    const title = firstUserMessage 
      ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
      : 'New Chat';

    let chatHistory: IChatHistory;

    if (chatId) {
      // Update existing chat
      console.log('🔄 Updating existing chat:', chatId);
      
      const updatedChat = await ChatHistory.findByIdAndUpdate(
        chatId,
        {
          messages: messages.map((msg: IMessage) => ({
            ...msg,
            timestamp: msg.timestamp || new Date()
          })),
          projectState: processedProjectState,
          updatedAt: new Date(),
          userName: userName || undefined
        },
        { new: true }
      );

      if (!updatedChat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      chatHistory = updatedChat;
    } else {
      // Create new chat
      console.log('✨ Creating new chat for user:', userEmail);
      
      const newChat = new ChatHistory({
        userId,
        userEmail,
        userName: userName || undefined,
        title,
        messages: messages.map((msg: IMessage) => ({
          ...msg,
          timestamp: msg.timestamp || new Date()
        })),
        projectState: processedProjectState,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });

      chatHistory = await newChat.save();
    }

    console.log('✅ Chat saved successfully:', chatHistory._id);
    if (processedProjectState) {
      console.log('📁 Project state saved with', processedProjectState.files.length, 'files');
    }

    res.status(200).json({
      success: true,
      chatId: chatHistory._id,
      title: chatHistory.title,
      filesCount: processedProjectState?.files.length || 0,
      message: chatId ? 'Chat updated successfully' : 'Chat saved successfully'
    });

  } catch (error) {
    console.error('❌ Error saving chat:', error);
    res.status(500).json({ 
      error: 'Failed to save chat',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
} 