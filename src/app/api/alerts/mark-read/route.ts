import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { id, created_at } = await req.json();

  const { error } = await supabase
    .from('alert')
    .update({ message_status: 'read' })
    .eq('uid', id)
    .eq('created_at', created_at);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
