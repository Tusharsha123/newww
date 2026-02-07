"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function sendOtp() {
    setStatus(null);
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
    setStatus(null);
    if (!otp) return;
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });
    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Logged in.");
  }

  return (
    <main className="min-h-screen bg-[#bfe47a] text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-10">
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl md:max-w-md">
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#1d1d59] text-white font-bold">
              DB
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-[#1d1d59]">Welcome Back</h1>
            <p className="mt-2 text-sm text-[#1d1d59]/70">
              Login to manage orders and quick reorders.
            </p>
          </div>

          <form className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#1d1d59]">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your number"
                className="mt-2 w-full rounded-xl border border-[#e0d9ff] px-4 py-3 text-sm"
              />
            </div>
            {otpSent && (
              <div>
                <label className="text-xs font-semibold text-[#1d1d59]">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="mt-2 w-full rounded-xl border border-[#e0d9ff] px-4 py-3 text-sm"
                />
              </div>
            )}
            <button
              type="button"
              onClick={sendOtp}
              className="w-full rounded-full bg-[#1d1d59] py-3 text-sm font-semibold text-white"
            >
              Send OTP
            </button>
            {otpSent && (
              <button
                type="button"
                onClick={verifyOtp}
                className="w-full rounded-full bg-white py-3 text-sm font-semibold text-[#1d1d59] shadow"
              >
                Verify & Login
              </button>
            )}
          </form>
          {status && <p className="mt-4 text-xs text-[#1d1d59]/70">{status}</p>}

          <div className="mt-6 flex items-center justify-between text-xs text-[#1d1d59]/70">
            <a href="/" className="font-semibold text-[#1d1d59]">Back to Home</a>
            <a href="/order">Explore Menu</a>
          </div>
        </div>
      </section>
    </main>
  );
}
