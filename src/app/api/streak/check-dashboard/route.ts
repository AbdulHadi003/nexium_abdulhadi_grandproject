import supabase from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { uid, category } = await req.json();

  if (!uid || !category) {
    return NextResponse.json({ streak: 0 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("streak")
    .select("streak_count, last_date")
    .eq("uid", uid)
    .eq("category", category)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ streak: 0 });
  }

  if (!data.last_date) {
    return NextResponse.json({ streak: 0 });
  }

  const last = new Date(data.last_date);
  const now = new Date(today);

  const diff =
    (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

  if (diff >= 2) {
    return NextResponse.json({ streak: 0 });
  }

  return NextResponse.json({ streak: data.streak_count });
}
