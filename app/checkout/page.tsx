"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/data/products";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import ExpressCheckout from "@/components/ExpressCheckout";

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const cartIsEmpty = items.length === 0;
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    postalCode: "",
    neighborhood: "",
    street: "",
    number: "",
  });
  const [loading, setLoading] = useState(false);
  const [captureMessage, setCaptureMessage] = useState("");
  const [expressError, setExpressError] = useState("");
  const router = useRouter();

  const handleExpressSuccess = (orderId: string) => {
    clearCart();
    setCaptureMessage("¡Pago confirmado! Gracias por tu pedido.");
    router.replace(`/checkout?status=confirmed&order=${orderId}`);
  };

  const handleExpressError = (message: string) => {
    setExpressError(message);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paypalOrderId = params.get("token");
    const status = params.get("status");
    const stored = window.localStorage.getItem("timeshop_checkout_data");
    if (!paypalOrderId || status !== "success" || !stored) return;

    const captureOrder = async () => {
      setLoading(true);
      setCaptureMessage("Confirming your PayPal payment...");
      try {
        const checkoutData = JSON.parse(stored) as Record<string, unknown>;
        const response = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...checkoutData, orderId: paypalOrderId }),
        });
        if (!response.ok) throw new Error("Payment confirmation failed");
        window.localStorage.removeItem("timeshop_checkout_data");
        clearCart();
        setCaptureMessage("Payment confirmed. Thank you for your order.");
        router.replace("/checkout?status=confirmed");
      } catch {
        setCaptureMessage("We could not confirm the payment yet. Please contact support before trying again.");
      } finally {
        setLoading(false);
      }
    };

    void captureOrder();
  }, [clearCart, router]);

  const handlePayPalCheckout = async (event: FormEvent) => {
    event.preventDefault();

    if (items.length === 0) {
      alert("Your bag is empty.");
      return;
    }

    setLoading(true);

    try {
      const orderId = `ts-${Date.now()}`;
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
          currency: "MXN",
          orderId,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        alert(data.error || "We were unable to complete your purchase. Please try again.");
        return;
      }

      const data = (await response.json()) as { approvalUrl?: string };
      if (data.approvalUrl) {
        window.localStorage.setItem(
          "timeshop_checkout_data",
          JSON.stringify({
            orderId,
            customerName: `${form.name} ${form.lastName}`.trim(),
            email: form.email,
            phone: form.phone,
            shippingAddress: {
              state: form.state,
              city: form.city,
              postalCode: form.postalCode,
              neighborhood: form.neighborhood,
              street: form.street,
              number: form.number,
            },
            items: items.map((item) => ({
              productId: String(item.id),
              productName: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            total,
            currency: "MXN",
          }),
        );

        window.location.href = data.approvalUrl;
      }
    } catch {
      alert("We were unable to complete your purchase. Please try again or contact us.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-shell checkout-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero compact-hero">
        <span className="eyebrow subdued">Secure checkout</span>
        <h1>Complete your order</h1>
        <p>Fast, protected, and easy to manage without creating an account.</p>
        {captureMessage ? <p className="checkout-status" role="status">{captureMessage}</p> : null}
      </div>

      <div className="checkout-steps" aria-label="Checkout progress">
        <span className="is-active">1. Contact</span>
        <span className="is-active">2. Shipping</span>
        <span>3. Payment</span>
        <span>4. Order review</span>
      </div>

      <form className="form-shell checkout-form" onSubmit={handlePayPalCheckout}>
        <div className="form-card checkout-card">
          <div className="checkout-section">
            <p className="guest-checkout-note">Guest checkout is available. No account is required to purchase.</p>
            <h3>Contact details</h3>
            <div className="field-row two-col">
              <div className="field">
                <label>First name</label>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </div>
              <div className="field">
                <label>Last name</label>
                <input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required />
              </div>
            </div>
            <div className="field-row two-col">
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              </div>
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h3>Shipping information</h3>
            <div className="field-row two-col">
              <div className="field">
                <label>State</label>
                <input value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} required />
              </div>
              <div className="field">
                <label>City</label>
                <input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required />
              </div>
            </div>
            <div className="field-row two-col">
              <div className="field">
                <label>Postal code</label>
                <input value={form.postalCode} onChange={(event) => setForm({ ...form, postalCode: event.target.value })} required />
              </div>
              <div className="field">
                <label>Neighborhood</label>
                <input value={form.neighborhood} onChange={(event) => setForm({ ...form, neighborhood: event.target.value })} required />
              </div>
            </div>
            <div className="field-row two-col">
              <div className="field">
                <label>Street</label>
                <input value={form.street} onChange={(event) => setForm({ ...form, street: event.target.value })} required />
              </div>
              <div className="field">
                <label>Number</label>
                <input value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} required />
              </div>
            </div>
          </div>
        </div>

        <aside className="summary-card order-summary">
          <div className="summary-topline">
            <span className="eyebrow subdued">Payment</span>
          </div>
          <h3 style={{ marginTop: 0 }}>Secure order</h3>
          <div className="secure-note">
            <strong>Pago seguro</strong>
            <div>Aceptamos PayPal, Apple Pay y Google Pay. Tus datos están protegidos con cifrado SSL.</div>
          </div>

          {expressError ? (
            <p style={{ color: "#dc2626", fontSize: 14, margin: "8px 0" }} role="alert">
              {expressError}
            </p>
          ) : null}

          <ExpressCheckout onSuccess={handleExpressSuccess} onError={handleExpressError} />

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
            <span style={{ fontSize: 12, color: "#6b7280" }}>o</span>
            <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
          </div>

          <div className="meta-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="meta-row"><span>Shipping</span><span>{formatPrice(shipping)}</span></div>
          <div className="total-row"><span>Total</span><span>{formatPrice(total)}</span></div>
          <div style={{ marginTop: 18 }}>
            <button
              className="primary-button"
              style={{ width: "100%" }}
              type="submit"
              disabled={loading}
              onClick={() => {
                if (cartIsEmpty) {
                  alert("Your bag is empty. Add a product before checking out.");
                }
              }}
            >
              {loading ? "Processing..." : "Pay with PayPal"}
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <Link href="/returns-policy" className="ghost-button" style={{ width: "100%" }}>
              Return policy
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
