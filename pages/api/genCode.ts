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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }


  const { prompt } = req.body as { prompt?: string };
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: "You are DevOPs Enginner with world class UI/UX designing knowledge of applications." },
        {
          role: "user",
          content: `"${prompt}" make sure to select a unique color pallete, think what sections does the required websites have, then build using modern designs.`,
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
