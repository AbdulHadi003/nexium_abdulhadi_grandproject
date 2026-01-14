import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { id, writing } = await req.json();
const today = new Date().toISOString().replace("T", " ").slice(0, 10);

  const { data: existing, error: checkError } = await supabase
    .from('habits')
    .select('id')
    .eq('id', id)
    .eq('created_at', today)
    .maybeSingle();

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ message: 'Already submitted' }, { status: 409 });
  }

  const { error: insertError } = await supabase
    .from('habits')
    .insert({ id, created_at: today, writing });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }
    const histRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/streak/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid: id,
      category: "habit",
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
