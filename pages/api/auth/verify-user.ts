import  connectToDatabase  from "@/lib/mongo";
import { compare } from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  const { db } = await connectToDatabase();
  const user = await db.collection("users").findOne({ email });

  if (!user) return res.status(401).json({ error: "No user found" });

  const isValid = await compare(password, user.hashedPassword);
  if (!isValid) return res.status(401).json({ error: "Incorrect password" });

  // Remove password before returning
  const { hashedPassword, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
}
