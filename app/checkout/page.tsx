"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/data/products";

export default function CheckoutPage() {
  const { subtotal, shipping, total } = useCart();

  const handlePayPalCheckout = async () => {
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number((total / 100).toFixed(2)),
          currency: "MXN",
          orderId: `ts-${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        alert(data.error || "No pudimos completar tu pago. Por favor, inténtalo nuevamente.");
        return;
      }

      const data = (await response.json()) as { approvalUrl?: string };
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      }
    } catch {
      alert("No pudimos completar tu pago. Por favor, inténtalo nuevamente o contacta con nosotros.");
    }
  };

  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Checkout</h1>
        <p>Completa tu compra sin necesidad de crear una cuenta.</p>
      </div>

      <div className="form-shell">
        <div className="form-card">
          <h3 style={{ marginTop: 0 }}>Datos de contacto</h3>
          <div className="field">
            <label>Nombre</label>
            <input defaultValue="Ana" />
          </div>
          <div className="field">
            <label>Apellido</label>
            <input defaultValue="García" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" defaultValue="ana@email.com" />
          </div>
          <div className="field">
            <label>Teléfono</label>
            <input defaultValue="5512345678" />
          </div>

          <h3>Dirección</h3>
          <div className="field">
            <label>Estado</label>
            <input defaultValue="Ciudad de México" />
          </div>
          <div className="field">
            <label>Ciudad</label>
            <input defaultValue="CDMX" />
          </div>
          <div className="field">
            <label>Código Postal</label>
            <input defaultValue="06600" />
          </div>
          <div className="field">
            <label>Colonia</label>
            <input defaultValue="Roma Norte" />
          </div>
          <div className="field">
            <label>Calle</label>
            <input defaultValue="Av. Álvaro Obregón" />
          </div>
          <div className="field">
            <label>Número</label>
            <input defaultValue="245" />
          </div>
        </div>

        <aside className="summary-card">
          <h3 style={{ marginTop: 0 }}>Pago</h3>
          <div style={{ marginBottom: 16, color: "#49413d" }}>
            <strong>Pago seguro</strong>
            <div>Procesado de forma segura por PayPal</div>
            <div className="muted">Protección de compra para transacciones elegibles</div>
          </div>

          <div className="meta-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="meta-row"><span>Envío</span><span>{formatPrice(shipping)}</span></div>
          <div className="total-row"><span>Total</span><span>{formatPrice(total)}</span></div>
          <div style={{ marginTop: 18 }}>
            <button className="primary-button" style={{ width: "100%" }} onClick={handlePayPalCheckout}>
              Pagar con PayPal
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <Link href="/returns-policy" className="ghost-button" style={{ width: "100%" }}>
              Ver política de devoluciones
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
