import axios from "axios";

const SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const BASE_URL = process.env.FLUTTERWAVE_BASE_URL || "https://api.flutterwave.com/v3";

export async function initiate({ amount, email, name, phone, txRef, redirectUrl }) {
  const { data } = await axios.post(`${BASE_URL}/payments`, {
    tx_ref: txRef,
    amount,
    currency: "RWF",
    redirect_url: redirectUrl,
    customer: { email, name, phonenumber: phone },
    customizations: { title: "MURAKAZA", description: "Order payment" },
  }, { headers: { Authorization: `Bearer ${SECRET_KEY}` } });
  return { tx_ref: txRef, status: "pending", checkout_url: data.data.link };
}

export async function verify(flwTransactionId) {
  const { data } = await axios.get(`${BASE_URL}/transactions/${flwTransactionId}/verify`, {
    headers: { Authorization: `Bearer ${SECRET_KEY}` },
  });
  return { status: data.data.status, raw: data.data };
}