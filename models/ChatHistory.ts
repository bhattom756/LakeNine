import mongoose from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IGeneratedFile {
  fileName: string;
  filePath: string;
  content: string;
  size: number;
  lastModified: Date;
}

export interface IProjectState {
  files: IGeneratedFile[];
  fileStructure: any; // File tree structure
  previewUrl?: string;
  projectType: 'react' | 'vue' | 'angular' | 'vanilla';
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatHistory {
  _id?: string;
  userId: string;
  userEmail: string;
  userName?: string;
  title: string;
  messages: IMessage[];
  projectState?: IProjectState; // Generated files and project state
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const GeneratedFileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

const ProjectStateSchema = new mongoose.Schema({
  files: [GeneratedFileSchema],
  fileStructure: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  previewUrl: {
    type: String,
    required: false
  },
  projectType: {
    type: String,
    enum: ['react', 'vue', 'angular', 'vanilla'],
    default: 'react'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const ChatHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  messages: [MessageSchema],
  projectState: {
    type: ProjectStateSchema,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
});

ChatHistorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

ChatHistorySchema.index({ userId: 1, createdAt: -1 });
ChatHistorySchema.index({ userEmail: 1, createdAt: -1 });

export default mongoose.models.ChatHistory || mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema); 