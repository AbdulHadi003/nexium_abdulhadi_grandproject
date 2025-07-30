import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { text } = await req.json();
  const prompt = `This is one of the daily journals of a mental health tracker web app user. Analyze how their day went emotionally and mentally in 4 to 5 sentences:\n\n${text}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const json = await res.json();

  console.log("Gemini API Response:", JSON.stringify(json, null, 2)); // 👈 Add this!

  const analysis = json?.candidates?.[0]?.content?.parts?.[0]?.text;

  return NextResponse.json({ analysis: analysis ?? "No analysis available." });
}
