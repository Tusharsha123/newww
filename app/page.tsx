"use client";

import { useEffect, useState } from "react";
import { buildWhatsAppLink, buildWhatsAppQR, DEFAULT_WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { content, Lang } from "@/lib/lang";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

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

type BusinessType = "juice" | "restaurant" | "clothing" | "kitchen" | "grocery";

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = content[lang];
  const [businessName, setBusinessName] = useState("Dheeru Bhai Juice");
  const [tagline, setTagline] = useState(t.tagline);
  const [deliveryNote, setDeliveryNote] = useState(t.deliveryNote);
  const [businessNote, setBusinessNote] = useState(t.businessNote);
  const [services, setServices] = useState<string[]>([
    "Catering Packs",
    "Subscriptions",
    "Corporate Orders",
  ]);
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP_NUMBER);
  const [brandPrimary, setBrandPrimary] = useState("#1d1d59");
  const [brandAccent, setBrandAccent] = useState("#ff9c1b");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [businessType, setBusinessType] = useState<BusinessType>("juice");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const host = window.location.hostname.replace(/^www\./, "");
    const loadTenant = async () => {
      const { data } = await supabase
        .from("shops")
        .select("id, name, tagline, delivery_note, business_note, services, whatsapp_number, branding, business_type")
        .contains("domains", [host])
        .eq("is_active", true)
        .maybeSingle();
      if (data?.name) setBusinessName(data.name);
      if (data?.tagline) setTagline(data.tagline);
      if (data?.delivery_note) setDeliveryNote(data.delivery_note);
      if (data?.business_note) setBusinessNote(data.business_note);
      if (data?.services) setServices(data.services as string[]);
      if (data?.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
      if (data?.branding?.primary) setBrandPrimary(data.branding.primary);
      if (data?.branding?.accent) setBrandAccent(data.branding.accent);
      if (data?.business_type) setBusinessType(data.business_type as BusinessType);

      if (data?.id) {
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
      }
    };
    loadTenant();
  }, []);

  return (
    <main
      className="min-h-screen bg-[#bfe47a] text-slate-900"
      style={{
        ["--brand-primary" as string]: brandPrimary,
        ["--brand-accent" as string]: brandAccent,
      }}
    >
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#cdea95]" />
          <div className="absolute top-32 right-12 h-24 w-24 rounded-full border-2 border-[#a7d66a]/60" />
          <div className="absolute bottom-12 left-1/3 h-16 w-16 rotate-12 rounded-lg border-2 border-[#a7d66a]/60" />
        </div>

        <section className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {/* Top Bar */}
          <div className="flex items-center justify-between rounded-2xl bg-[#dcd7ff] px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[var(--brand-primary)] text-white grid place-items-center text-sm font-bold">
                DB
              </div>
              <span className="font-semibold text-[var(--brand-primary)]">{businessName}</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--brand-primary)]">
              <a href="/" className="font-semibold">Home</a>
              <a href="/order">Order</a>
              <a href="/login">Login</a>
            </nav>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === "en" ? "hi" : "en")}
                className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-[var(--brand-primary)]"
              >
                {lang === "en" ? "हिंदी" : "English"}
              </button>
            </div>
          </div>

          {/* Hero */}
          <div id="home" className="mt-8 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative">
              <div className="absolute -left-8 top-4 hidden md:flex flex-col items-center gap-2 text-xs text-[#1d1d59]/70">
                {["04", "03", "02", "01"].map((step, index) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <span className={index === 3 ? "text-[#1d1d59] font-semibold" : ""}>{step}</span>
                    {index !== 3 && <span className="h-4 w-px bg-[#1d1d59]/30" />}
                  </div>
                ))}
              </div>

              <h1 className="text-3xl font-extrabold leading-tight text-[var(--brand-primary)] sm:text-4xl md:text-5xl">
                {businessType === "restaurant" && "Delicious meals to"}
                {businessType === "clothing" && "Fresh styles to"}
                {businessType === "kitchen" && "Homemade goodness to"}
                {businessType === "grocery" && "Fresh groceries to"}
                {businessType === "juice" && "Glass of fresh juice to"}
                <span className="block text-[var(--brand-accent)]">make your day</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm text-[var(--brand-primary)]/80">
                {tagline} — Jagadhri Aggarsen Chowk. Fresh juices, fruit shakes,
                fruit chaat, and seasonal fruit boxes for students, families, and local businesses.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 print:hidden">
                <a
                  href={buildWhatsAppLink(whatsappNumber, "Hello! I would like to place an order.")}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[var(--brand-accent)] px-6 py-3 text-sm font-semibold text-[var(--brand-primary)] shadow-md"
                >
                  {t.order}
                </a>
                <a
                  href="/order"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-primary)] shadow-md"
                >
                  Order Now
                </a>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--brand-primary)]">{t.deliveryTitle}</p>
                  <p className="mt-1 text-xs text-[var(--brand-primary)]/80">{deliveryNote}</p>
                </div>
                <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--brand-primary)]">{t.businessTitle}</p>
                  <p className="mt-1 text-xs text-[var(--brand-primary)]/80">{businessNote}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl bg-white p-8 shadow-xl">
                <div className="flex items-center gap-6">
                  <div className="grid place-items-center rounded-3xl bg-[#f6efe6] p-6">
                    {businessType === "juice" && (
                      <svg
                        width="160"
                        height="200"
                        viewBox="0 0 160 200"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M80 0C66 18 62 34 62 44C53 34 40 28 26 26C36 40 48 50 62 56C50 56 36 62 24 72C40 70 54 70 68 78C52 86 42 100 38 118C52 108 66 104 82 106C72 122 70 140 72 160C82 140 90 128 100 122C104 134 104 150 100 170C114 150 122 126 122 100C122 64 106 34 80 0Z"
                          fill="#7CB342"
                        />
                        <ellipse cx="80" cy="140" rx="52" ry="56" fill="#F6A623" />
                        <path d="M40 120L120 120" stroke="#E09116" strokeWidth="6" />
                        <path d="M36 140L124 140" stroke="#E09116" strokeWidth="6" />
                        <path d="M44 160L116 160" stroke="#E09116" strokeWidth="6" />
                      </svg>
                    )}
                    {businessType === "restaurant" && (
                      <svg width="160" height="200" viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="26" y="20" width="108" height="160" rx="20" fill="#FFE8C2" />
                        <rect x="42" y="36" width="76" height="18" rx="9" fill="#F3B562" />
                        <rect x="52" y="80" width="12" height="84" rx="6" fill="#9C5B2D" />
                        <rect x="96" y="80" width="12" height="84" rx="6" fill="#9C5B2D" />
                        <rect x="64" y="92" width="32" height="10" rx="5" fill="#9C5B2D" />
                      </svg>
                    )}
                    {businessType === "clothing" && (
                      <svg width="160" height="200" viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M40 46L80 20L120 46L106 70L96 64V170H64V64L54 70L40 46Z" fill="#D8E2FF" />
                        <rect x="64" y="100" width="32" height="60" rx="8" fill="#8AA4FF" />
                      </svg>
                    )}
                    {businessType === "kitchen" && (
                      <svg width="160" height="200" viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="24" y="40" width="112" height="120" rx="16" fill="#E6F4EA" />
                        <rect x="40" y="60" width="80" height="18" rx="9" fill="#7BC096" />
                        <rect x="56" y="90" width="48" height="48" rx="10" fill="#2E8B57" />
                      </svg>
                    )}
                    {businessType === "grocery" && (
                      <svg width="160" height="200" viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="32" y="40" width="96" height="120" rx="18" fill="#F5F0FF" />
                        <circle cx="64" cy="86" r="16" fill="#B28BFF" />
                        <circle cx="96" cy="86" r="16" fill="#6D5BD0" />
                        <rect x="56" y="120" width="48" height="24" rx="12" fill="#B28BFF" />
                      </svg>
                    )}
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-[var(--brand-primary)]">Today’s Top Picks</p>
                    <div className="rounded-xl bg-[#f7f4ff] px-4 py-3 text-xs text-[var(--brand-primary)]">
                      Pomegranate 500ml • ₹180
                    </div>
                    <div className="rounded-xl bg-[#f7f4ff] px-4 py-3 text-xs text-[var(--brand-primary)]">
                      Oreo Shake 500ml • ₹70
                    </div>
                    <div className="rounded-xl bg-[#f7f4ff] px-4 py-3 text-xs text-[var(--brand-primary)]">
                      Fruit Chaat 500g • ₹70
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 left-4 right-4 rounded-2xl bg-[var(--brand-primary)] p-4 text-white shadow-lg">
                <p className="text-xs font-semibold uppercase text-white/70">Business Specials</p>
                <p className="mt-1 text-sm">
                  Office packs, event catering, and weekly fruit subscriptions.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Quick Actions */}
          <div className="mt-16 grid gap-4 sm:hidden">
            <a
              href={buildWhatsAppLink(whatsappNumber, "Hello! I would like to place an order.")}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-primary)] shadow-sm"
            >
              WhatsApp Order
            </a>
            <a
              href="/order"
              className="rounded-2xl bg-[var(--brand-primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm"
            >
              Order Now
            </a>
          </div>

          {/* Services */}
          <div id="services" className="mt-16">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold text-[var(--brand-primary)]">Business Services</h2>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {services.map((service) => (
                <div key={service} className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--brand-primary)]">{service}</p>
                  <p className="mt-2 text-sm text-[var(--brand-primary)]/80">
                    {businessNote}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div id="menu" className="mt-16">
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold text-[var(--brand-primary)]">Menu & Combos</h2>
              <span className="text-xs text-[var(--brand-primary)]/70">{t.seasonalNote}</span>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => {
                const itemsForCategory = products.filter((p) => p.category_id === category.id);
                if (itemsForCategory.length === 0) return null;
                return (
                  <div key={category.id} className="rounded-2xl bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-[var(--brand-primary)]">{category.name}</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {itemsForCategory.map((product) => (
                        <li key={product.id} className="flex justify-between gap-2">
                          <span className="text-[var(--brand-primary)]/80">{product.name}</span>
                          <span className="font-semibold text-[var(--brand-primary)]">₹{product.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* QR Codes */}
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-[var(--brand-primary)]">WhatsApp Order</p>
              <div className="mt-4 flex justify-center">
                <Image
                  src={buildWhatsAppQR(whatsappNumber, "Hello! I would like to place an order.")}
                  alt="WhatsApp QR"
                  width={180}
                  height={180}
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Map */}
          <div id="location" className="mt-12 rounded-3xl bg-white p-4 shadow-sm">
            <iframe
              title="Google Map"
              className="h-64 w-full rounded-2xl"
              loading="lazy"
              src="https://www.google.com/maps?q=Aggarsen%20Chowk%20Jagadhri&output=embed"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
