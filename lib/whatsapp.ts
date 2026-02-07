export const DEFAULT_WHATSAPP_NUMBER = "917988237504";

export function buildWhatsAppLink(number: string, message: string) {
  const safeNumber = number || DEFAULT_WHATSAPP_NUMBER;
  return `https://wa.me/${safeNumber}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppQR(number: string, message: string) {
  const link = buildWhatsAppLink(number, message);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    link,
  )}`;
}
