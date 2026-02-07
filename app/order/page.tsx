"use client";

import { useEffect, useMemo, useState } from "react";
import { buildWhatsAppLink, DEFAULT_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { supabase } from "@/lib/supabaseClient";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
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
  category_id: string;
  is_active: boolean;
};

export default function OrderPage() {
  const [selection, setSelection] = useState<Record<string, number>>({});
  const [payment] = useState<"COD">("COD");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("Dheeru Bhai Juice");
  const [deliveryNote, setDeliveryNote] = useState("Delivery: 4–5 km, minimum order ₹200");
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP_NUMBER);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brandPrimary, setBrandPrimary] = useState("#1d1d59");
  const [brandAccent, setBrandAccent] = useState("#ff9c1b");
  const [messageTemplate, setMessageTemplate] = useState(
    "{shop} Order\n{items}\nTotal: {total}\nPayment: COD\n{delivery_note}\nCustomer: {name}\nPhone: {phone}\nAddress: {address}",
  );
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const items = useMemo(() => {
    const list: CartItem[] = [];
    products.forEach((product) => {
      const qty = selection[product.id] ?? 0;
      if (qty > 0) {
        list.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          qty,
        });
      }
    });
    return list;
  }, [selection, products]);

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  function updateQty(productId: string, delta: number) {
    setSelection((prev) => {
      const next = { ...prev };
      const current = next[productId] ?? 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        delete next[productId];
      } else {
        next[productId] = updated;
      }
      return next;
    });
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname.replace(/^www\./, "");
    const loadShop = async () => {
      const { data } = await supabase
        .from("shops")
        .select("id, name, delivery_note, whatsapp_number, message_template, branding")
        .contains("domains", [host])
        .eq("is_active", true)
        .maybeSingle();
      if (!data) return;
      setTenantId(data.id);
      if (data.name) setBusinessName(data.name);
      if (data.delivery_note) setDeliveryNote(data.delivery_note);
      if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
      if (data.message_template) setMessageTemplate(data.message_template);
      if (data.branding?.primary) setBrandPrimary(data.branding.primary);
      if (data.branding?.accent) setBrandAccent(data.branding.accent);

      const { data: categoryData } = await supabase
        .from("categories")
        .select("id, name")
        .eq("shop_id", data.id)
        .order("name");
      const { data: productData } = await supabase
        .from("products")
        .select("id, name, description, price, category_id, is_active")
        .eq("shop_id", data.id)
        .eq("is_active", true)
        .order("name");
      setCategories(categoryData || []);
      setProducts(productData || []);
    };
    loadShop();
  }, []);

  useEffect(() => {
    if (!phone || phone.length < 7) return;
    let isActive = true;
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("customers")
        .select("name, phone, address")
        .eq("phone", phone)
        .maybeSingle();
      if (!isActive || !data) return;
      if (!name) setName(data.name ?? "");
      if (!address) setAddress(data.address ?? "");
    }, 500);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [phone, name, address]);

  function buildMessage(itemsText: string, orderId?: string | number | null) {
    const replacements: Record<string, string> = {
      "{shop}": businessName,
      "{items}": itemsText,
      "{total}": `₹${total}`,
      "{delivery_note}": deliveryNote,
      "{name}": name || "__________",
      "{phone}": phone || "__________",
      "{address}": address || "__________",
      "{order_id}": orderId ? String(orderId) : "",
    };
    return Object.entries(replacements).reduce(
      (acc, [key, value]) => acc.replaceAll(key, value),
      messageTemplate,
    );
  }

  async function sendOtp() {
    if (!phone || phone.length < 7) {
      setStatus("Enter a valid phone number.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      setStatus(error.message);
      return;
    }
    setOtpSent(true);
    setStatus("OTP sent.");
  }

  async function verifyOtp() {
    if (!otpCode) return;
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otpCode,
      type: "sms",
    });
    if (error) {
      setStatus(error.message);
      return;
    }
    if (data?.session) {
      setPhoneVerified(true);
      setStatus("Phone verified.");
    }
  }

  async function sendWhatsApp() {
    const lines = items.map((item) => `${item.name} x${item.qty} = ₹${item.price * item.qty}`);
    if (!phoneVerified) {
      setStatus("Verify your phone before placing the order.");
      return;
    }
    setSaving(true);
    setStatus(null);
    let orderId: string | number | null = null;
    try {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .upsert(
          { name, phone, address },
          { onConflict: "phone" },
        )
        .select("id")
        .single();

      if (customerError) throw customerError;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          shop_id: tenantId,
          customer_id: customer?.id,
          total,
          payment_method: payment,
          paid: false,
          status: "new",
        })
        .select("id")
        .single();

      if (orderError) throw orderError;
      orderId = order?.id ?? null;

      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
      }));
      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);
        if (itemsError) throw itemsError;
      }
      setStatus("Order saved.");
    } catch (error) {
      setStatus("Could not save order to database. WhatsApp will still open.");
    } finally {
      setSaving(false);
    }

    const message = buildMessage(lines.join("\n"), orderId);
    const link = buildWhatsAppLink(whatsappNumber, message);
    if (typeof window !== "undefined") {
      window.open(link, "_blank", "noreferrer");
    }
  }

  return (
    <main
      className="min-h-screen bg-[#bfe47a] text-slate-900"
      style={{
        ["--brand-primary" as string]: brandPrimary,
        ["--brand-accent" as string]: brandAccent,
      }}
    >
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between rounded-2xl bg-[#dcd7ff] px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--brand-primary)] text-sm font-bold text-white">
              DB
            </div>
            <span className="font-semibold text-[var(--brand-primary)]">{businessName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--brand-primary)]">
            <a href="/" className="font-semibold">Home</a>
            <a href="/login">Login</a>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-white p-6 shadow-xl">
            <h1 className="text-2xl font-extrabold text-[var(--brand-primary)]">Select Items</h1>
            <p className="mt-2 text-sm text-[var(--brand-primary)]/70">Choose items and quantities. Minimum delivery order ₹200.</p>

            <div className="mt-6 space-y-6">
              {categories.map((category) => {
                const itemsForCategory = products.filter((p) => p.category_id === category.id);
                if (itemsForCategory.length === 0) return null;
                return (
                  <div key={category.id}>
                    <h2 className="text-sm font-semibold uppercase text-[var(--brand-primary)]/70">
                      {category.name}
                    </h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {itemsForCategory.map((product) => (
                        <div key={product.id} className="flex items-center justify-between rounded-2xl border border-[#ece7ff] bg-[#f7f4ff] px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--brand-primary)]">{product.name}</p>
                            <p className="text-xs text-[var(--brand-primary)]/60">₹{product.price}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQty(product.id, -1)}
                              className="h-7 w-7 rounded-full bg-white text-[var(--brand-primary)] shadow"
                            >
                              -
                            </button>
                            <span className="min-w-[20px] text-center text-sm font-semibold text-[var(--brand-primary)]">
                              {selection[product.id] ?? 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQty(product.id, 1)}
                              className="h-7 w-7 rounded-full bg-[var(--brand-primary)] text-white shadow"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-extrabold text-[var(--brand-primary)]">Order Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              {items.length === 0 ? (
                <p className="text-[var(--brand-primary)]/60">No items selected yet.</p>
              ) : (
                items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between">
                    <span className="text-[var(--brand-primary)]/80">{item.name} x{item.qty}</span>
                    <span className="font-semibold text-[var(--brand-primary)]">₹{item.price * item.qty}</span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-[var(--brand-primary)] p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total</span>
                <span className="text-lg font-semibold">₹{total}</span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#f7f4ff] p-4">
              <p className="text-sm font-semibold text-[var(--brand-primary)]">Payment Method</p>
              <p className="mt-2 text-sm text-[var(--brand-primary)]/70">Cash on Delivery only.</p>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-[var(--brand-primary)]">Delivery Address</p>
              <div className="mt-2 grid gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Customer name"
                  className="w-full rounded-2xl border border-[#ece7ff] bg-white px-4 py-3 text-sm text-[var(--brand-primary)]"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full rounded-2xl border border-[#ece7ff] bg-white px-4 py-3 text-sm text-[var(--brand-primary)]"
                />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House no, street, area, landmark"
                  rows={3}
                  className="w-full rounded-2xl border border-[#ece7ff] bg-white px-4 py-3 text-sm text-[var(--brand-primary)]"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={sendOtp}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[var(--brand-primary)] shadow"
                >
                  Send OTP
                </button>
                {otpSent && (
                  <>
                    <input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter OTP"
                      className="rounded-2xl border border-[#ece7ff] px-3 py-2 text-xs text-[var(--brand-primary)]"
                    />
                    <button
                      type="button"
                      onClick={verifyOtp}
                      className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-xs font-semibold text-white"
                    >
                      Verify
                    </button>
                  </>
                )}
                {phoneVerified && (
                  <span className="text-xs font-semibold text-green-700">Verified</span>
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--brand-primary)]/60">
                OTP verification required to place the order.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={sendWhatsApp}
                disabled={items.length === 0 || saving}
                className="rounded-full bg-[var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Send on WhatsApp"}
              </button>
            </div>

            <p className="mt-4 text-xs text-[var(--brand-primary)]/60">
              Minimum delivery order ₹200.
            </p>
            {status && (
              <p className="mt-2 text-xs text-[var(--brand-primary)]/70">{status}</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
