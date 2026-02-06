import { prices } from "@/data/prices";
import { whatsappLink, whatsappQR } from "@/lib/whatsapp";
import { motion } from "framer-motion";
import Image from "next/image";

export const metadata = {
  title: "Dheeru Bhai Juice | Fresh Juices & Shakes in Jagadhri",
  description:
    "Order 100% fresh fruit juices and milk shakes from Dheeru Bhai Juice. Hygienic, fast delivery available in Jagadhri.",
  keywords: [
    "Fresh Juice Jagadhri",
    "Milk Shakes Jagadhri",
    "Dheeru Bhai Juice",
    "Juice Home Delivery",
  ],
  openGraph: {
    title: "Dheeru Bhai Juice",
    description: "Fresh • Hygienic • Delivered Fast",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-400 to-orange-500 p-4">
      <section className="mx-auto max-w-[794px] bg-yellow-50 p-8 rounded-none print:w-[794px] print:h-[1123px]">

        {/* Title */}
        <h1 className="text-center text-5xl font-extrabold text-red-600">
          DHEERU BHAI
          <span className="block text-red-500">JUICE</span>
        </h1>

        <p className="mt-3 text-center bg-red-600 text-white py-2 rounded font-semibold">
          Fresh • Hygienic • Delivered Fast
        </p>

        <p className="text-center mt-4 text-green-700 font-semibold">
          100% Fresh Fruit Juices & Shakes <br />
          Home Delivery Available
        </p>

        {/* Order CTA */}
        <div className="flex flex-col items-center mt-6 gap-4 print:hidden">
          <a
            href={whatsappLink}
            target="_blank"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold shadow"
          >
            Order on WhatsApp
          </a>
        </div>

        {/* Menu */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Juices */}
          <div className="bg-white p-6 rounded-xl">
            <h2 className="bg-red-600 text-white text-center py-2 rounded font-bold">
              Fresh Juices (300 ml)
            </h2>
            <ul className="mt-4 space-y-2">
              {Object.entries(prices.juices).map(([item, price]) => (
                <li key={item} className="flex justify-between">
                  <span>{item}</span>
                  <span className="font-semibold">₹{price}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Shakes */}
          <div className="bg-white p-6 rounded-xl">
            <h2 className="bg-blue-600 text-white text-center py-2 rounded font-bold">
              Milk Shakes (350–400 ml)
            </h2>
            <ul className="mt-4 space-y-2">
              {Object.entries(prices.shakes).map(([item, price]) => (
                <li key={item} className="flex justify-between">
                  <span>{item}</span>
                  <span className="font-semibold">₹{price}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Combos */}
        <div className="mt-8">
          <h2 className="bg-green-700 text-white text-center py-2 rounded font-bold">
            Special Combos
          </h2>
          <ul className="mt-4 space-y-2">
            <li>Citrus Duo – ₹110</li>
            <li>Tropical Trio – ₹140</li>
            <li>Energy Booster – ₹120</li>
            <li>Classic Shake Pair – ₹160</li>
            <li className="font-bold">Family Juice Pack – ₹220</li>
          </ul>
        </div>

        {/* QR Code */}
        <div className="mt-10 flex flex-col items-center">
          <p className="font-semibold mb-2">Scan to Order on WhatsApp</p>
          <Image
            src={whatsappQR}
            alt="WhatsApp Order QR"
            width={200}
            height={200}
            unoptimized
          />
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center font-bold text-gray-700">
          📍 Aggarsen Chowk, Jagadhri <br />
          📞 +91 7988237504
        </footer>

      </section>
    </main>
  );
}
