"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Shop = {
  id?: string;
  owner_id?: string;
  name: string;
  slug: string;
  domains: string[];
  tagline?: string;
  delivery_note?: string;
  business_note?: string;
  branding?: {
    primary?: string;
    accent?: string;
  };
  services?: string[];
  whatsapp_number?: string;
  message_template?: string;
  address?: string;
  banner_text?: string;
  business_hours?: string;
  is_active?: boolean;
  business_type?: string;
};

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  category_id: string | null;
};

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customers: {
    name: string | null;
    phone: string | null;
    address: string | null;
  }[] | null;
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [shopId, setShopId] = useState<string | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [orderRevenue, setOrderRevenue] = useState(0);

  const [name, setName] = useState("Dheeru Bhai Juice");
  const [slug, setSlug] = useState("dheeru");
  const [primaryDomain, setPrimaryDomain] = useState("");
  const [extraDomains, setExtraDomains] = useState("");
  const [tagline, setTagline] = useState("Fresh • Hygienic • Delivered Fast");
  const [deliveryNote, setDeliveryNote] = useState("Delivery: 4–5 km, minimum order ₹200");
  const [businessNote, setBusinessNote] = useState("Corporate orders, school events, weekly subscriptions available.");
  const [primaryColor, setPrimaryColor] = useState("#1d1d59");
  const [accentColor, setAccentColor] = useState("#ff9c1b");
  const [servicesText, setServicesText] = useState("Catering Packs\nSubscriptions\nCorporate Orders");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("{shop} Order\n{items}\nTotal: {total}");
  const [address, setAddress] = useState("");
  const [bannerText, setBannerText] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [businessType, setBusinessType] = useState("juice");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductImage, setNewProductImage] = useState("");
  const [newProductActive, setNewProductActive] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
      setSessionReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const loadShop = async () => {
      const { data } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", userId)
        .maybeSingle();
      if (!data) return;
      setShopId(data.id ?? null);
      setName(data.name ?? "");
      setSlug(data.slug ?? "");
      setPrimaryDomain((data.domains && data.domains[0]) || "");
      setExtraDomains((data.domains || []).slice(1).join(", "));
      setTagline(data.tagline ?? "");
      setDeliveryNote(data.delivery_note ?? "");
      setBusinessNote(data.business_note ?? "");
      setPrimaryColor(data.branding?.primary ?? primaryColor);
      setAccentColor(data.branding?.accent ?? accentColor);
      setServicesText((data.services || []).join("\n"));
      setWhatsappNumber(data.whatsapp_number ?? "");
      setMessageTemplate(data.message_template ?? messageTemplate);
      setAddress(data.address ?? "");
      setBannerText(data.banner_text ?? "");
      setBusinessHours(data.business_hours ?? "");
      setIsActive(Boolean(data.is_active));
      setBusinessType(data.business_type ?? "juice");
    };
    loadShop();
  }, [userId, primaryColor, accentColor, messageTemplate]);

  useEffect(() => {
    if (!shopId) return;
    const loadCatalog = async () => {
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id, name")
        .eq("shop_id", shopId)
        .order("name");
      const { data: productData } = await supabase
        .from("products")
        .select("id, name, description, price, image_url, is_active, category_id")
        .eq("shop_id", shopId)
        .order("name");
      setCategories(categoryData || []);
      setProducts(productData || []);
    };
    loadCatalog();
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;
    const loadOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, total, status, created_at, customers(name, phone, address)")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      setOrders((data || []) as Order[]);
    };
    loadOrders();
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;
    const loadStats = async () => {
      const { data } = await supabase
        .from("orders")
        .select("total")
        .eq("shop_id", shopId);
      const totals = (data || []).map((row) => Number(row.total) || 0);
      setOrderCount(totals.length);
      setOrderRevenue(totals.reduce((sum, value) => sum + value, 0));
    };
    loadStats();
  }, [shopId]);

  async function signIn() {
    setStatus(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setStatus(error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserId(null);
  }

  async function signUp() {
    setStatus(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setStatus(error.message);
    else setStatus("Check email to confirm signup.");
  }

  async function saveShop() {
    if (!userId) return;
    setSaving(true);
    setStatus(null);
    const domains = [primaryDomain, ...extraDomains.split(",")]
      .map((d) => d.trim())
      .filter(Boolean);

    const payload: Shop = {
      owner_id: userId,
      name,
      slug,
      domains,
      tagline,
      delivery_note: deliveryNote,
      business_note: businessNote,
      branding: { primary: primaryColor, accent: accentColor },
      services: servicesText.split("\n").map((s) => s.trim()).filter(Boolean),
      whatsapp_number: whatsappNumber,
      message_template: messageTemplate,
      address,
      banner_text: bannerText,
      business_hours: businessHours,
      is_active: isActive,
      business_type: businessType,
    };

    const { data, error } = await supabase
      .from("shops")
      .upsert(payload, { onConflict: "owner_id" })
      .select("id")
      .single();

    if (error) {
      setStatus(error.message);
    } else {
      setShopId(data?.id ?? null);
      setStatus("Saved.");
    }
    setSaving(false);
  }

  async function addCategory() {
    if (!shopId || !newCategory.trim()) return;
    const { data, error } = await supabase
      .from("categories")
      .insert({ shop_id: shopId, name: newCategory.trim() })
      .select("id, name")
      .single();
    if (!error && data) {
      setCategories((prev) => [...prev, data]);
      setNewCategory("");
    }
  }

  async function deleteCategory(categoryId: string) {
    await supabase.from("categories").delete().eq("id", categoryId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setProducts((prev) => prev.filter((p) => p.category_id !== categoryId));
  }

  async function addProduct() {
    if (!shopId || !newProductName.trim() || !newProductPrice) return;
    const priceValue = Number(newProductPrice);
    if (Number.isNaN(priceValue)) return;
    const { data, error } = await supabase
      .from("products")
      .insert({
        shop_id: shopId,
        name: newProductName.trim(),
        price: priceValue,
        description: newProductDescription.trim() || null,
        image_url: newProductImage.trim() || null,
        is_active: newProductActive,
        category_id: newProductCategory || null,
      })
      .select("id, name, description, price, image_url, is_active, category_id")
      .single();
    if (!error && data) {
      setProducts((prev) => [...prev, data]);
      setNewProductName("");
      setNewProductPrice("");
      setNewProductDescription("");
      setNewProductImage("");
      setNewProductActive(true);
      setNewProductCategory("");
    }
  }

  async function updateProduct(updated: Product) {
    const { error } = await supabase
      .from("products")
      .update({
        name: updated.name,
        description: updated.description,
        price: updated.price,
        image_url: updated.image_url,
        is_active: updated.is_active,
        category_id: updated.category_id,
      })
      .eq("id", updated.id);
    if (!error) {
      setStatus("Product updated.");
    }
  }

  async function deleteProduct(productId: string) {
    await supabase.from("products").delete().eq("id", productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  async function updateOrderStatus(orderId: string, statusValue: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: statusValue })
      .eq("id", orderId);
    if (!error) {
      setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, status: statusValue } : order));
    }
  }

  if (!sessionReady) {
    return <div className="p-6 text-gray-900">Loading...</div>;
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#bfe47a] text-slate-900">
        <section className="mx-auto max-w-md px-4 py-12">
          <div className="rounded-3xl bg-white p-6 shadow-xl">
            <h1 className="text-2xl font-extrabold text-[#1d1d59]">Admin Login</h1>
            <p className="mt-2 text-sm text-[#1d1d59]/70">Sign in to manage your storefront.</p>
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
              <button
                type="button"
                onClick={signUp}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1d1d59] shadow"
              >
                Sign Up
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
              <h1 className="text-2xl font-extrabold text-[#1d1d59]">Admin Panel</h1>
              <p className="text-xs text-[#1d1d59]/60">Manage your shop settings and products.</p>
            </div>
            <div className="flex gap-2">
              <a href="/" className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1d1d59] shadow">
                Home
              </a>
              <a href="/order" className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1d1d59] shadow">
                Orders
              </a>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full bg-[#1d1d59] px-4 py-2 text-xs font-semibold text-white"
              >
                Sign Out
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-[#1d1d59]/70">
            Manage branding, menu, services, and pricing for your domain.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[#1d1d59]">Business Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1d1d59]">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1d1d59]">Primary Domain</label>
              <input
                value={primaryDomain}
                onChange={(e) => setPrimaryDomain(e.target.value)}
                placeholder="example.com"
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1d1d59]">Extra Domains (comma separated)</label>
              <input
                value={extraDomains}
                onChange={(e) => setExtraDomains(e.target.value)}
                placeholder="shop1.com, shop2.com"
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[#1d1d59]">Tagline</label>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1d1d59]">Delivery Note</label>
              <input
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[#1d1d59]">Business Note</label>
              <input
                value={businessNote}
                onChange={(e) => setBusinessNote(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[#1d1d59]">Primary Color</label>
              <input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1d1d59]">Accent Color</label>
              <input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[#1d1d59]">WhatsApp Number</label>
              <input
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1d1d59]">Business Hours</label>
              <input
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1d1d59]">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              >
                <option value="juice">Juice</option>
                <option value="restaurant">Restaurant</option>
                <option value="clothing">Clothing</option>
                <option value="kitchen">Kitchen</option>
                <option value="grocery">Grocery</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[#1d1d59]">Banner Text</label>
              <input
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-[#1d1d59]">Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="text-xs font-semibold text-[#1d1d59]">Services (one per line)</label>
            <textarea
              value={servicesText}
              onChange={(e) => setServicesText(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
            />
          </div>

          <div className="mt-6">
            <label className="text-xs font-semibold text-[#1d1d59]">WhatsApp Message Template</label>
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-[#ece7ff] px-4 py-3 text-sm"
            />
            <p className="mt-2 text-xs text-[#1d1d59]/70">
              Placeholders: {"{shop}"} {"{items}"} {"{total}"} {"{delivery_note}"} {"{name}"} {"{phone}"} {"{address}"} {"{order_id}"}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[#1d1d59]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Shop Active
            </label>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={saveShop}
              disabled={saving}
              className="rounded-full bg-[#1d1d59] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : shopId ? "Save Shop" : "Create Shop"}
            </button>
            {status && <p className="text-xs text-[#1d1d59]/70">{status}</p>}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-[#f7f4ff] p-4">
              <p className="text-xs text-[#1d1d59]/70">Total Orders</p>
              <p className="mt-1 text-xl font-semibold text-[#1d1d59]">{orderCount}</p>
            </div>
            <div className="rounded-2xl bg-[#f7f4ff] p-4">
              <p className="text-xs text-[#1d1d59]/70">Revenue</p>
              <p className="mt-1 text-xl font-semibold text-[#1d1d59]">₹{orderRevenue}</p>
            </div>
            <div className="rounded-2xl bg-[#f7f4ff] p-4">
              <p className="text-xs text-[#1d1d59]/70">Shop ID</p>
              <p className="mt-1 text-xs font-semibold text-[#1d1d59] break-all">{shopId || "—"}</p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-extrabold text-[#1d1d59]">Categories</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category"
                className="w-full rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm md:w-64"
              />
              <button
                type="button"
                onClick={addCategory}
                className="rounded-full bg-[#1d1d59] px-4 py-2 text-sm font-semibold text-white"
              >
                Add Category
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-2xl bg-[#f7f4ff] px-4 py-3">
                  <span className="text-sm font-semibold text-[#1d1d59]">{category.name}</span>
                  <button
                    type="button"
                    onClick={() => deleteCategory(category.id)}
                    className="text-xs text-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-extrabold text-[#1d1d59]">Products</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Product name"
                className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm"
              />
              <input
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                placeholder="Price"
                className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm"
              />
              <select
                value={newProductCategory}
                onChange={(e) => setNewProductCategory(e.target.value)}
                className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <input
                value={newProductImage}
                onChange={(e) => setNewProductImage(e.target.value)}
                placeholder="Image URL"
                className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm"
              />
              <input
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
                placeholder="Description"
                className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm md:col-span-2"
              />
              <label className="flex items-center gap-2 text-sm text-[#1d1d59] md:col-span-2">
                <input
                  type="checkbox"
                  checked={newProductActive}
                  onChange={(e) => setNewProductActive(e.target.checked)}
                />
                Active
              </label>
              <button
                type="button"
                onClick={addProduct}
                className="rounded-full bg-[#1d1d59] px-4 py-2 text-sm font-semibold text-white md:col-span-2"
              >
                Add Product
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              {products.map((product) => (
                <div key={product.id} className="rounded-2xl border border-[#ece7ff] p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={product.name}
                      onChange={(e) => setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, name: e.target.value } : p))}
                      className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm"
                    />
                    <input
                      value={product.price}
                      onChange={(e) => setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, price: Number(e.target.value) || 0 } : p))}
                      className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm"
                    />
                    <select
                      value={product.category_id ?? ""}
                      onChange={(e) => setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, category_id: e.target.value || null } : p))}
                      className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm"
                    >
                      <option value="">No category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <input
                      value={product.image_url ?? ""}
                      onChange={(e) => setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, image_url: e.target.value } : p))}
                      placeholder="Image URL"
                      className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm"
                    />
                    <input
                      value={product.description ?? ""}
                      onChange={(e) => setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, description: e.target.value } : p))}
                      placeholder="Description"
                      className="rounded-2xl border border-[#ece7ff] px-4 py-2 text-sm md:col-span-2"
                    />
                    <label className="flex items-center gap-2 text-sm text-[#1d1d59]">
                      <input
                        type="checkbox"
                        checked={product.is_active}
                        onChange={(e) => setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_active: e.target.checked } : p))}
                      />
                      Active
                    </label>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateProduct(product)}
                      className="rounded-full bg-[#1d1d59] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-extrabold text-[#1d1d59]">Orders</h2>
            <div className="mt-4 grid gap-4">
              {orders.map((order) => {
                const customer = order.customers?.[0] ?? null;
                return (
                  <div key={order.id} className="rounded-2xl border border-[#ece7ff] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1d1d59]">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-[#1d1d59]/60">
                        {customer?.name || "Unknown"} • {customer?.phone || "—"}
                      </p>
                      <p className="text-xs text-[#1d1d59]/60">
                        {customer?.address || "No address"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#1d1d59]">₹{order.total}</p>
                      <p className="text-xs text-[#1d1d59]/60">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select
                      value={order.status || "new"}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="rounded-2xl border border-[#ece7ff] px-3 py-2 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="preparing">Preparing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
