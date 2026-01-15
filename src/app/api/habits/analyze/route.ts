import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { text } = await req.json();

  const prompt =`The following is a daily activities tracking entry from a mental health app user. Analyze their activities and suggest improvements in 3-5 sentences:\n\n${text}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const json = await res.json();
  const analysis = json?.candidates?.[0]?.content?.parts?.[0]?.text;

  return NextResponse.json({ analysis: analysis ?? "No analysis available." });
}
