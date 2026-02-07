export const upiId = "dheerubhaijuice@upi";
export const upiName = "Dheeru Bhai Juice";

export const upiQR = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}&pn=${encodeURIComponent(
  upiName,
)}`;

export function buildUpiLink(amount?: number) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: upiName,
    cu: "INR",
  });
  if (amount && amount > 0) {
    params.set("am", amount.toFixed(2));
  }
  return `upi://pay?${params.toString()}`;
}
