// /pages/api/auth/signup.ts
import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongo";
import bcrypt from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, password } = req.body;

  if (!email || !password || !name)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const client = await clientPromise;
    const db = client.db();
    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({ message: "User created" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}
