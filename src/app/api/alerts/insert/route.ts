import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { id, date, message } = await req.json();

  const { error } = await supabase.from('alert').insert([
    {
      uid: id,
      created_at: date,
      message,
      message_status: 'unread',
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

