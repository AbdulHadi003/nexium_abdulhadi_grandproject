import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { id, message } = await req.json();

    if (!id || !message) {
      return NextResponse.json(
        { error: 'Missing id or message' },
        { status: 400 }
      );
    }

    // Always generate timestamp on SERVER
    const now = new Date().toISOString().replace("T", " ").slice(0, 10); // timestamp with time

    const { error } = await supabase.from('alert').insert([
      {
        uid: id,                 // Firebase UID
        created_at: now,         // TIMESTAMP (server-side)
        message,
        message_status: 'unread',
      },
    ]);

    // 🟡 Duplicate alert for same day → silently ignore
    if (error) {
      // Postgres unique index violation
      if (error.code === '23505') {
        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
