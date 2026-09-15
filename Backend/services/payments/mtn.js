import axios from "axios";

const BASE_URL = process.env.MTN_MOMO_BASE_URL;
const SUB_KEY = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
const API_USER = process.env.MTN_MOMO_API_USER;
const API_KEY = process.env.MTN_MOMO_API_KEY;
const TARGET_ENV = process.env.MTN_MOMO_TARGET_ENV || "sandbox";

async function getToken() {
  const auth = Buffer.from(`${API_USER}:${API_KEY}`).toString("base64");
  const { data } = await axios.post(`${BASE_URL}/collection/token/`, {}, {
    headers: { Authorization: `Basic ${auth}`, "Ocp-Apim-Subscription-Key": SUB_KEY },
  });
  return data.access_token;
}

export async function initiate({ amount, phone, txRef }) {
  const token = await getToken();
  await axios.post(`${BASE_URL}/collection/v1_0/requesttopay`, {
    amount: String(amount),
    currency: "RWF",
    externalId: txRef,
    payer: { partyIdType: "MSISDN", partyId: phone },
    payerMessage: "MURAKAZA order payment",
    payeeNote: "MURAKAZA order payment",
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": txRef,
      "X-Target-Environment": TARGET_ENV,
      "Ocp-Apim-Subscription-Key": SUB_KEY,
      "Content-Type": "application/json",
    },
  });
  return { tx_ref: txRef, status: "pending", message: "USSD prompt sent to customer's phone" };
}

export async function verify(txRef) {
  const token = await getToken();
  const { data } = await axios.get(`${BASE_URL}/collection/v1_0/requesttopay/${txRef}`, {
    headers: { Authorization: `Bearer ${token}`, "X-Target-Environment": TARGET_ENV, "Ocp-Apim-Subscription-Key": SUB_KEY },
  });
  return { status: data.status, raw: data };
}