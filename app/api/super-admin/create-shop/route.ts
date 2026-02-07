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

export async function POST(request: NextRequest) {
  const adminId = await isSuperAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email, password, shopName, slug, domains } = body;
  if (!email || !password || !shopName || !slug || !Array.isArray(domains)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const ownerId = userData.user?.id;
  if (!ownerId) {
    return NextResponse.json({ error: "User creation failed" }, { status: 500 });
  }

  const { error: shopError } = await supabaseAdmin
    .from("shops")
    .insert({
      owner_id: ownerId,
      name: shopName,
      slug,
      domains,
      is_active: true,
    });

  if (shopError) {
    return NextResponse.json({ error: shopError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
