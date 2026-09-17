// Rwandan phone number + mobile money validation.
//
// Rules:
//   - Every valid Rwandan mobile number has 10 digits and starts with "07".
//   - MTN Mobile Money numbers start with 078 or 079.
//   - Tigo Cash / Airtel-Tigo numbers start with 072 or 073.
//   - Any other 07x number is treated as a generic Rwandan phone (used for
//     things like the general "phone" field on register/create-staff where
//     we don't yet know which network they'll pay with).
//
// Accepts numbers typed as 078xxxxxxx, +250 78xxxxxxx, or 25078xxxxxxx and
// normalizes them all to the local 10-digit 07XXXXXXXX format.

const MTN_PREFIXES = ["078", "079"];
const TIGO_PREFIXES = ["072", "073"];

/**
 * Normalize a phone number to the local 10-digit 07XXXXXXXX format.
 * Returns null if it can't be normalized into that shape.
 */
export function normalizePhone(rawPhone) {
  if (!rawPhone) return null;
  let phone = String(rawPhone).trim().replace(/[\s-]/g, "");

  if (phone.startsWith("+250")) phone = phone.slice(4);
  else if (phone.startsWith("250")) phone = phone.slice(3);

  if (!phone.startsWith("0") && phone.length === 9) phone = `0${phone}`;

  return phone;
}

/** True if the number is a well-formed Rwandan mobile number (any network). */
export function isValidRwandaPhone(rawPhone) {
  const phone = normalizePhone(rawPhone);
  return !!phone && /^07\d{8}$/.test(phone);
}

/** Which mobile money network a number belongs to: "mtn_momo", "tigo_cash", or null. */
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
 * provider: "mtn_momo" | "tigo_cash"
 * Returns { valid: boolean, message?: string, normalized?: string }
 */
export function validateMomoPhone(rawPhone, provider) {
  const phone = normalizePhone(rawPhone);

  if (!phone || !/^07\d{8}$/.test(phone)) {
    return { valid: false, message: "Enter a valid 10-digit Rwandan phone number (e.g. 0781234567)." };
  }

  if (provider === "mtn_momo") {
    if (!MTN_PREFIXES.some((p) => phone.startsWith(p))) {
      return { valid: false, message: "MTN Mobile Money numbers must start with 078 or 079." };
    }
  } else if (provider === "tigo_cash") {
    if (!TIGO_PREFIXES.some((p) => phone.startsWith(p))) {
      return { valid: false, message: "Tigo Cash numbers must start with 072 or 073." };
    }
  }
  // irembopay / flutterwave / bank_transfer / cash_on_delivery accept any valid Rwandan number.

  return { valid: true, normalized: phone };
}