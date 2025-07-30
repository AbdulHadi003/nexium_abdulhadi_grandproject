import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { uid, mood_ } = await req.json();

    if (!uid || !mood_) {
      return NextResponse.json({ error: "Missing uid or mood_" }, { status: 400 });
    }

    const today = new Date().toISOString().replace("T", " ").slice(0, 19); // 'YYYY-MM-DD'

    const { data: maxRow, error: maxErr } = await supabase
      .from("mood")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle(); // ✅ handles empty table safely

    if (maxErr) {
      console.error("Max ID fetch error:", maxErr);
      return NextResponse.json({ error: maxErr.message }, { status: 500 });
    }

    const nextId = (maxRow?.id || 0) + 1;

    const { error: insertError } = await supabase.from("mood").insert([
      {
        created_at: today,
        id: nextId,
        mood_,
        uid,
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: nextId });
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("Unexpected error:", err.message);
  } else {
    console.error("Unexpected error:", err);
  }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
        