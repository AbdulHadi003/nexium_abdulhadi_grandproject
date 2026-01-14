import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { uid, category } = await req.json();

  if (!uid || !category) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: existing, error } = await supabase
    .from("streak")
    .select("streak_count, last_date")
    .eq("uid", uid)
    .eq("category", category)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // CASE 1: no row exists
  if (!existing) {
    await supabase.from("streak").insert({
      uid,
      category,
      streak_count: 1,
      last_date: today,
    });

    return NextResponse.json({ streak: 1 });
  }

  if (!existing.last_date) {
    await supabase
      .from("streak")
      .update({ streak_count: 1, last_date: today })
      .eq("uid", uid)
      .eq("category", category);

    return NextResponse.json({ streak: 1 });
  }

  const last = new Date(existing.last_date);
  const now = new Date(today);

  const diff =
    (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

  // diff = 0 → already counted today
  if (diff === 0) {
    return NextResponse.json({ streak: existing.streak_count });
  }

  // diff = 1 → increment
  if (diff === 1) {
    const newStreak = existing.streak_count + 1;

    await supabase
      .from("streak")
      .update({
        streak_count: newStreak,
        last_date: today,
      })
      .eq("uid", uid)
      .eq("category", category);

    return NextResponse.json({ streak: newStreak });
  }

  // diff ≥ 2 → reset
  await supabase
    .from("streak")
    .update({
      streak_count: 1,
      last_date: today,
    })
    .eq("uid", uid)
    .eq("category", category);

  return NextResponse.json({ streak: 1 });
}
