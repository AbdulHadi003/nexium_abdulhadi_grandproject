import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { id, date } = await req.json(); // id = UID

  const { data, error } = await supabase
    .from('alert')
    .select('created_at')
    .eq('uid', id)
    .eq('created_at', date)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ exists: !!data });
}
