import mongoose from "mongoose"
import { GeneratedApp, GeneratedFile } from "@/types"

const GeneratedFileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  path: { type: String, required: true },
});

const GeneratedAppSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  files: [GeneratedFileSchema],
  dependencies: { type: Map, of: String },
  userId: { type: String, required: true },
  prompt: { type: String, required: true },
  generatedCode: { type: String, required: true },
  fileStructure: [{ type: String }],
  testResults: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export type GeneratedAppDocument = mongoose.Document & GeneratedApp;

export default mongoose.models.GeneratedApp || mongoose.model<GeneratedAppDocument>("GeneratedApp", GeneratedAppSchema);
