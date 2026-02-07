"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Shop = {
  id: string;
  name: string;
  slug: string;
  domains: string[];
  is_active: boolean;
  owner_id: string;
};

export default function SuperAdminPage() {
  const [sessionReady, setSessionReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [slug, setSlug] = useState("");
  const [domains, setDomains] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
      setSessionReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn() {
    setStatus(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setStatus(error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setToken(null);
  }

  async function loadShops() {
    if (!token) return;
    const res = await fetch("/api/super-admin/shops", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setShops(data.shops || []);
      setStatus(null);
    } else {
      setStatus(data.error || "Failed to load shops");
    }
  }

  async function createShop() {
    if (!token) return;
    const payload = {
      email: newEmail,
      password: newPassword,
      shopName,
      slug,
      domains: domains.split(",").map((d) => d.trim()).filter(Boolean),
    };
    const res = await fetch("/api/super-admin/create-shop", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Failed to create shop");
      return;
    }
    setStatus("Shop created.");
    setNewEmail("");
    setNewPassword("");
    setShopName("");
    setSlug("");
    setDomains("");
    await loadShops();
  }

  async function toggleShop(shopId: string, isActive: boolean) {
    if (!token) return;
    const res = await fetch("/api/super-admin/toggle-shop", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shopId, isActive }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Failed to update shop");
      return;
    }
    setShops((prev) => prev.map((shop) => shop.id === shopId ? { ...shop, is_active: isActive } : shop));
  }

  async function updateShop(shopId: string, name: string, slugValue: string, shopDomains: string[]) {
    if (!token) return;
    const res = await fetch("/api/super-admin/update-shop", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shopId, name, slug: slugValue, domains: shopDomains }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Failed to update shop");
      return;
    }
    setStatus("Shop updated.");
  }

  if (!sessionReady) {
    return <div className="p-6 text-gray-900">Loading...</div>;
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#bfe47a] text-slate-900">
        <section className="mx-auto max-w-md px-4 py-12">
          <div className="rounded-3xl bg-white p-6 shadow-xl">
            <h1 className="text-2xl font-extrabold text-[#1d1d59]">Super Admin Login</h1>
            <div className="mt-4 grid gap-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={signIn}
                className="rounded-full bg-[#1d1d59] px-4 py-2 text-sm font-semibold text-white"
              >
                Sign In
              </button>
            </div>
            {status && <p className="mt-3 text-xs text-[#1d1d59]/70">{status}</p>}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#bfe47a] text-slate-900">
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1d1d59]">Super Admin</h1>
              <p className="text-xs text-[#1d1d59]/60">Create and manage all stores.</p>
            </div>
            <div className="flex gap-2">
              <a href="/" className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1d1d59] shadow">
                Home
              </a>
              <button
                type="button"
                onClick={loadShops}
                className="rounded-full bg-[#1d1d59] px-4 py-2 text-xs font-semibold text-white"
              >
                Refresh Shops
              </button>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full bg-[#1d1d59] px-4 py-2 text-xs font-semibold text-white"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-[#1d1d59]">Create Shop</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Admin Email"
                className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm"
              />
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Admin Password"
                className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm"
              />
              <input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Shop Name"
                className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm"
              />
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Slug"
                className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm"
              />
              <input
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
                placeholder="Domains (comma separated)"
                className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm md:col-span-2"
              />
              <button
                type="button"
                onClick={createShop}
                className="rounded-full bg-[#1d1d59] px-4 py-2 text-sm font-semibold text-white md:col-span-2"
              >
                Create Shop
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-[#1d1d59]">All Shops</h2>
            <div className="mt-4 grid gap-4">
              {shops.map((shop) => (
                <div key={shop.id} className="rounded-2xl border border-[#ece7ff] p-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <input
                      defaultValue={shop.name}
                      onChange={(e) => setShops((prev) => prev.map((s) => s.id === shop.id ? { ...s, name: e.target.value } : s))}
                      className="rounded-2xl border border-[#ece7ff] px-3 py-2 text-sm"
                    />
                    <input
                      defaultValue={shop.slug}
                      onChange={(e) => setShops((prev) => prev.map((s) => s.id === shop.id ? { ...s, slug: e.target.value } : s))}
                      className="rounded-2xl border border-[#ece7ff] px-3 py-2 text-sm"
                    />
                    <input
                      defaultValue={shop.domains.join(", ")}
                      onChange={(e) => setShops((prev) => prev.map((s) => s.id === shop.id ? { ...s, domains: e.target.value.split(",").map((d) => d.trim()).filter(Boolean) } : s))}
                      className="rounded-2xl border border-[#ece7ff] px-3 py-2 text-sm md:col-span-3"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateShop(shop.id, shop.name, shop.slug, shop.domains)}
                        className="rounded-full bg-[#1d1d59] px-4 py-2 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleShop(shop.id, !shop.is_active)}
                        className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1d1d59] shadow"
                      >
                        {shop.is_active ? "Suspend" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {status && <p className="mt-4 text-xs text-[#1d1d59]/70">{status}</p>}
        </div>
      </section>
    </div>
  );
}
