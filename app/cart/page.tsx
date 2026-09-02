"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/data/products";
import { useState } from "react";

export default function CartPage() {
  const { items, subtotal, shipping, updateQuantity, removeFromCart } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const freeShippingThreshold = 2500;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : shipping;
  const finalTotal = subtotal + shippingCost - discount;

  return (
    <div className="container-shell cart-shell" style={{ padding: "24px 0 40px" }}>
      <div className="page-hero compact-hero">
        <span className="eyebrow subdued">Your bag</span>
        <h1>YOUR BAG</h1>
        <p>Review your selection before checkout and confirm your delivery details.</p>
      </div>

      <div className="cart-layout">
        <div className="form-card cart-card">
          <div className="list">
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="muted">Your bag is empty. Explore our curated collection for elevated essentials.</div>
                <Link href="/shop" className="primary-button" style={{ marginTop: 18 }}>
                  Continue shopping
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div style={{ flex: 1 }}>
                    <div className="cart-item-head">
                      <strong>{item.name}</strong>
                      <button className="text-button" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </div>
                    <div className="muted">{formatPrice(item.price)}</div>
                    <div className="qty-row" style={{ marginTop: 10 }}>
                      <button aria-label="Decrease quantity" onClick={() => updateQuantity(item.id, -1)}>
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button aria-label="Increase quantity" onClick={() => updateQuantity(item.id, 1)}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="summary-card order-summary">
          <div className="summary-topline">
            <span className="eyebrow subdued">Summary</span>
          </div>
          <h3 style={{ marginTop: 0 }}>Order overview</h3>
          <div className="meta-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
          <div className="free-shipping-box"><strong>{subtotal >= freeShippingThreshold ? "You unlocked FREE SHIPPING" : `Spend ${formatPrice(Math.max(0, freeShippingThreshold - subtotal))} more for free shipping`}</strong><div className="shipping-progress"><span style={{ width: `${freeShippingProgress}%` }} /></div></div>
          <div className="meta-row"><span>Shipping</span><span>{shippingCost ? formatPrice(shippingCost) : "FREE"}</span></div>
          <div className="meta-row"><span>Discount</span><span>—</span></div>
          <div className="coupon-row"><input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Promo code" /><button type="button" onClick={() => setDiscount(coupon.trim().toUpperCase() === "TIMESHOP10" ? Math.round(subtotal * 0.1) : 0)}>Apply</button></div>
          {discount > 0 ? <div className="meta-row"><span>Promo discount</span><span>-{formatPrice(discount)}</span></div> : null}
          <div className="total-row"><span>Total</span><span>{formatPrice(finalTotal)}</span></div>
          <div style={{ marginTop: 18 }}>
            <Link href="/checkout" className="primary-button" style={{ width: "100%" }}>
              Proceed to checkout
            </Link>
          </div>
          <div style={{ marginTop: 12 }}>
            <Link href="/shop" className="ghost-button" style={{ width: "100%" }}>
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
