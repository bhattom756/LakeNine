// pages/api/genCode.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Reject non-POST methods
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 2. Parse & validate body
  const { prompt } = req.body as { prompt?: string };
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    // 3. Call OpenAI (replace model as you like)
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // ✅ Use this
      messages: [
        { role: "system", content: "You are a web development assistant." },
        {
          role: "user",
          content: `Generate a complete HTML, CSS, JS website for: "${prompt}"`,
        },
      ],
    });

    const code = completion.choices[0].message.content || "";
    // Dummy file structure & test results
    const fileStructure = ["index.html", "styles.css", "app.js"];
    const testResults = ["✅ Navbar renders", "✅ Form validation works"];

    // 4. Return JSON
    return res.status(200).json({ code, fileStructure, testResults });
  } catch (err: any) {
    console.error("genCode error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
