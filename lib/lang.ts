export type Lang = "en" | "hi";

export const content: Record<
  Lang,
  {
    tagline: string;
    order: string;
    juices: string;
    shakes: string;
    fruitChaat: string;
    fruitCut: string;
    fruits: string;
    combos: string;
    deliveryTitle: string;
    deliveryNote: string;
    businessTitle: string;
    businessNote: string;
    seasonalNote: string;
  }
> = {
  en: {
    tagline: "Fresh • Hygienic • Delivered Fast",
    order: "Order on WhatsApp",
    juices: "Fresh Juices",
    shakes: "Milk Shakes",
    fruitChaat: "Fruit Chaat",
    fruitCut: "Fruit Cut",
    fruits: "Seasonal Fruits",
    combos: "Special Combos",
    deliveryTitle: "Delivery (4–5 km)",
    deliveryNote: "Minimum order ₹200 for home delivery.",
    businessTitle: "Bulk, Catering & Subscriptions",
    businessNote:
      "Corporate orders, school events, and weekly fruit/juice subscriptions available.",
    seasonalNote: "Seasonal fruit prices may change with market rates.",
  },
  hi: {
    tagline: "ताज़ा • स्वच्छ • तेज़ डिलीवरी",
    order: "व्हाट्सएप पर ऑर्डर करें",
    juices: "फ्रेश जूस",
    shakes: "मिल्क शेक",
    fruitChaat: "फ्रूट चाट",
    fruitCut: "फ्रूट कट",
    fruits: "मौसमी फल",
    combos: "स्पेशल कॉम्बो",
    deliveryTitle: "डिलीवरी (4–5 किमी)",
    deliveryNote: "होम डिलीवरी के लिए न्यूनतम ऑर्डर ₹200.",
    businessTitle: "बल्क, कैटरिंग और सब्सक्रिप्शन",
    businessNote:
      "कॉर्पोरेट ऑर्डर, स्कूल इवेंट्स और साप्ताहिक फल/जूस सब्सक्रिप्शन उपलब्ध.",
    seasonalNote: "मौसमी फलों के दाम बाजार के अनुसार बदल सकते हैं.",
  },
};
