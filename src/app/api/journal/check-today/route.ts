import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { id } = await req.json();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('journal')
    .select('id')
    .eq('id', id)
    .eq('created_at', today)
    .maybeSingle(); 

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submitted: !!data });
}

