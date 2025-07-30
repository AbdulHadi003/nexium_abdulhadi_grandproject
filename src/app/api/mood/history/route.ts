import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("mood")
    .select("created_at, mood_")
    .eq("uid", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
