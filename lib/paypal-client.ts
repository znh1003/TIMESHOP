export async function createPayPalOrder({ amount, currency = "MXN", orderId }: { amount: number; currency?: string; orderId: string }) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.PAYPAL_ENVIRONMENT === "production" ? "production" : "sandbox";

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are missing");
  }

  const tokenResponse = await fetch(
    environment === "production" ? "https://api.paypal.com/v1/oauth2/token" : "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    },
  );

  if (!tokenResponse.ok) {
    throw new Error("Unable to fetch PayPal access token");
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string };

  const orderResponse = await fetch(
    environment === "production" ? "https://api.paypal.com/v2/checkout/orders" : "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: "TIMESHOP",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/checkout?status=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/checkout?status=cancelled`,
        },
      }),
    },
  );

  if (!orderResponse.ok) {
    const text = await orderResponse.text();
    throw new Error(`PayPal order creation failed: ${text}`);
  }

  return orderResponse.json();
}

export async function capturePayPalOrder(orderId: string) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.PAYPAL_ENVIRONMENT === "production" ? "production" : "sandbox";

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are missing");
  }

  const tokenResponse = await fetch(
    environment === "production" ? "https://api.paypal.com/v1/oauth2/token" : "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    },
  );

  if (!tokenResponse.ok) {
    throw new Error("Unable to fetch PayPal access token");
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string };

  const captureResponse = await fetch(
    `${environment === "production" ? "https://api.paypal.com" : "https://api-m.sandbox.paypal.com"}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!captureResponse.ok) {
    const text = await captureResponse.text();
    throw new Error(`PayPal capture failed: ${text}`);
  }

  return captureResponse.json();
}
