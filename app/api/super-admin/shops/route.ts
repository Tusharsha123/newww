import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function isSuperAdmin(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.replace("Bearer ", "");
  const { data } = await supabaseAdmin.auth.getUser(token);
  const userId = data?.user?.id;
  if (!userId) return null;
  const { data: admin } = await supabaseAdmin
    .from("super_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return admin?.user_id ?? null;
}

export async function GET(request: NextRequest) {
  const adminId = await isSuperAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabaseAdmin
    .from("shops")
    .select("id, name, slug, domains, is_active, owner_id")
    .order("name");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ shops: data || [] });
}
