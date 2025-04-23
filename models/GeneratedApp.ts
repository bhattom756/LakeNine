import mongoose from "mongoose"

const GeneratedAppSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: String, required: true },
  generatedCode: { type: String, required: true },
  fileStructure: [{ type: String }],
  testResults: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.GeneratedApp || mongoose.model("GeneratedApp", GeneratedAppSchema);
