import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { id, writing } = await req.json();
const today = new Date().toISOString().replace("T", " ").slice(0, 19);

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

  return NextResponse.json({ message: 'Saved' });
}
