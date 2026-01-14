import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { id, date } = await req.json(); // date = YYYY-MM-DD

    if (!id || !date) {
      return NextResponse.json(
        { error: 'Missing id or date' },
        { status: 400 }
      );
    }

    const start = `${date}T00:00:00Z`;
    const end = `${date}T23:59:59.999Z`;

    const { data, error } = await supabase
      .from('alert')
      .select('created_at')
      .eq('uid', id)
      .gte('created_at', start)
      .lt('created_at', end)
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ exists: data.length > 0 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
