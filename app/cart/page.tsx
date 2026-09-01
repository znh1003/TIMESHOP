"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/data/products";

export default function CartPage() {
  const { items, subtotal, shipping, total, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="container-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero">
        <h1>Bolsa</h1>
        <p>Revisa tu selección antes de pagar.</p>
      </div>

      <div className="form-shell">
        <div className="form-card">
          <div className="list">
            {items.length === 0 ? (
              <div className="muted">Tu bolsa está vacía. Explora la colección premium.</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div style={{ flex: 1 }}>
                    <strong>{item.name}</strong>
                    <div className="muted">{formatPrice(item.price)}</div>
                    <div className="qty-row" style={{ marginTop: 10 }}>
                      <button aria-label="Disminuir" onClick={() => updateQuantity(item.id, -1)}>
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button aria-label="Aumentar" onClick={() => updateQuantity(item.id, 1)}>
                        +
                      </button>
                    </div>
                    <button className="ghost-button" style={{ marginTop: 10 }} onClick={() => removeFromCart(item.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="summary-card">
          <h3 style={{ marginTop: 0 }}>Resumen</h3>
          <div className="meta-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="meta-row"><span>Envío</span><span>{formatPrice(shipping)}</span></div>
          <div className="meta-row"><span>Cupon</span><span>—</span></div>
          <div className="total-row"><span>Total</span><span>{formatPrice(total)}</span></div>
          <div style={{ marginTop: 18 }}>
            <Link href="/checkout" className="primary-button" style={{ width: "100%" }}>
              Checkout
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
