import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { id, writing } = await req.json();

  // Get current date in YYYY-MM-DD format (UTC)
const today = new Date().toISOString().replace('T', ' ').slice(0, 10);

  // Check if journal already exists for today
  const { data: existing, error: checkError } = await supabase
    .from('journal')
    .select('id')
    .eq('id', id)
    .eq('created_at', today)
    .maybeSingle(); // prevents throwing if no match

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ message: 'Already submitted' }, { status: 409 });
  }

  // Insert journal entry
  const { error: insertError } = await supabase
    .from('journal')
    .insert({ id, created_at: today, writing });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }
    const histRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/streak/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid: id,
      category: "journal",
    }),
  });

  if (!histRes.ok) {
    console.error("Failed to update streak:", await histRes.text());
  } else {    
           const hist = await histRes.json();
        console.log("History from API:", hist);

  }

  return NextResponse.json({ message: 'Saved' });
}
