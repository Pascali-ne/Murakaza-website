// Tigo Cash has no single public REST API in Rwanda — get real docs/credentials from
// your supervisor once registered as a merchant, then fill in the two functions below.
import axios from "axios";

const BASE_URL = process.env.TIGO_CASH_BASE_URL;
const API_KEY = process.env.TIGO_CASH_API_KEY;
const MERCHANT_ID = process.env.TIGO_CASH_MERCHANT_ID;

export async function initiate({ amount, phone, txRef }) {
  if (!BASE_URL) throw new Error("Tigo Cash isn't configured yet.");
  const { data } = await axios.post(`${BASE_URL}/payment/request`, {
    merchantId: MERCHANT_ID, amount, msisdn: phone, reference: txRef,
  }, { headers: { Authorization: `Bearer ${API_KEY}` } });
  return { tx_ref: txRef, status: "pending", raw: data };
}

export async function verify(txRef) {
  if (!BASE_URL) throw new Error("Tigo Cash isn't configured yet.");
  const { data } = await axios.get(`${BASE_URL}/payment/status/${txRef}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  return { status: data.status, raw: data };
}