// pages/api/genCode.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { generateProjectWithAI } from "@/lib/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;
  
  try {
    // Use our local simulation instead of calling OpenAI
    const result = await generateProjectWithAI(prompt);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error generating code:", error);
    res.status(500).json({ error: "Failed to generate code" });
  }
}
