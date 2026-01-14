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


    const { error: insertError } = await supabase.from("mood").insert([
      {
        created_at: today,
        mood_,
        uid,
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
       const histRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/streak/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        category: "mood",
      }),
    });
      if (!histRes.ok) {
    console.error("Failed to update streak:", await histRes.text());
  } else {    
           const hist = await histRes.json();
        console.log("History from API:", hist);

  }

    return NextResponse.json({ success: true});
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("Unexpected error:", err.message);
  } else {
    console.error("Unexpected error:", err);
  }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
        