// Rwandan phone number + mobile money validation (mirrors Backend/utils/phoneValidation.js).
//
//   - Every valid Rwandan mobile number has 10 digits and starts with "07".
//   - MTN Mobile Money numbers start with 078 or 079.
//   - Tigo Cash / Airtel-Tigo numbers start with 072 or 073.

const MTN_PREFIXES = ["078", "079"];
const TIGO_PREFIXES = ["072", "073"];

export function normalizePhone(rawPhone) {
  if (!rawPhone) return null;
  let phone = String(rawPhone).trim().replace(/[\s-]/g, "");

  if (phone.startsWith("+250")) phone = phone.slice(4);
  else if (phone.startsWith("250")) phone = phone.slice(3);

  if (!phone.startsWith("0") && phone.length === 9) phone = `0${phone}`;

  return phone;
}

export function isValidRwandaPhone(rawPhone) {
  const phone = normalizePhone(rawPhone);
  return !!phone && /^07\d{8}$/.test(phone);
}

/** "mtn_momo" | "tigo_cash" | null */
export function detectNetwork(rawPhone) {
  const phone = normalizePhone(rawPhone);
  if (!phone || !/^07\d{8}$/.test(phone)) return null;
  const prefix = phone.slice(0, 3);
  if (MTN_PREFIXES.includes(prefix)) return "mtn_momo";
  if (TIGO_PREFIXES.includes(prefix)) return "tigo_cash";
  return null;
}

/**
 * Validate a phone number against a specific mobile money provider.
 * provider: "mtn_momo" | "tigo_cash" | undefined (generic check)
 * Returns { valid: boolean, message?: string, normalized?: string }
 */
export function validateMomoPhone(rawPhone, provider) {
  const phone = normalizePhone(rawPhone);

  if (!phone || !/^07\d{8}$/.test(phone)) {
    return { valid: false, message: "Enter a valid 10-digit Rwandan phone number (e.g. 0781234567)." };
  }

  if (provider === "mtn_momo" && !MTN_PREFIXES.some((p) => phone.startsWith(p))) {
    return { valid: false, message: "MTN Mobile Money numbers must start with 078 or 079." };
  }
  if (provider === "tigo_cash" && !TIGO_PREFIXES.some((p) => phone.startsWith(p))) {
    return { valid: false, message: "Tigo Cash numbers must start with 072 or 073." };
  }

  return { valid: true, normalized: phone };
}