import mongoose from "mongoose";

const MONGODB_URI = "mongodb://127.0.0.1:27017/lakenine";

export const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
};
