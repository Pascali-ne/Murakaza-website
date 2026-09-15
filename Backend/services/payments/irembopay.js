import axios from "axios";

const SECRET_KEY = process.env.IREMBOPAY_SECRET_KEY;
const BASE_URL = process.env.IREMBOPAY_BASE_URL || "https://api.irembopay.com";

export async function initiate({ amount, txRef, customerName, customerEmail, customerPhone, items }) {
  const { data } = await axios.post(`${BASE_URL}/payments/invoices`, {
    transactionId: txRef,
    paymentAccountIdentifier: process.env.IREMBOPAY_ACCOUNT_ID,
    customer: { email: customerEmail, phoneNumber: customerPhone, name: customerName },
    paymentItems: items.map((i) => ({ code: i.code || "PRODUCT", quantity: i.quantity, unitAmount: i.unit_price })),
    description: "MURAKAZA order payment",
    expiryAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    language: "EN",
  }, { headers: { "irembopay-secretKey": SECRET_KEY, "Content-Type": "application/json" } });
  return { tx_ref: txRef, status: "pending", checkout_url: data.data.paymentLinkUrl, invoice_number: data.data.invoiceNumber };
}

export async function verify(invoiceNumber) {
  const { data } = await axios.get(`${BASE_URL}/payments/invoices/${invoiceNumber}`, {
    headers: { "irembopay-secretKey": SECRET_KEY },
  });
  return { status: data.data.paymentStatus, raw: data.data };
}