"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart-provider";
import type { CheckoutDraftInput } from "@/components/ExpressCheckout";

type PayPalOfficialButtonsProps = {
  fundingSource?: string;
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
  checkoutData: CheckoutDraftInput;
  disabled: boolean;
};

declare global {
  interface Window {
    // PayPal is provided by the official browser SDK.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paypal?: any;
  }
}

export default function PayPalOfficialButtons({ fundingSource, onSuccess, onError, checkoutData, disabled }: PayPalOfficialButtonsProps) {
  const { items } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.paypal?.Buttons || items.length === 0) return;
    container.replaceChildren();

    const config: Record<string, unknown> = {
      style: { layout: "vertical", height: 48, shape: "pill", label: fundingSource === "card" ? "pay" : "paypal" },
      createOrder: async () => {
        const response = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: items.map((item) => ({ id: item.id, quantity: item.quantity })), currency: "MXN", orderId: `ts-${Date.now()}`, ...checkoutData }),
        });
        if (!response.ok) throw new Error("No se pudo iniciar el pago.");
        const data = await response.json() as { id?: string };
        if (!data.id) throw new Error("PayPal no devolvió un ID de orden.");
        return data.id;
      },
      onApprove: async (data: { orderID: string }) => {
        const response = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderID, items: items.map((item) => ({ productId: String(item.id), productName: item.name, price: item.price, quantity: item.quantity })) }),
        });
        if (!response.ok) throw new Error("No se pudo confirmar el pago.");
        onSuccess(data.orderID);
      },
      onCancel: () => undefined,
      onError: (error: Error) => onError(error.message || "El pago no pudo completarse."),
    };

    if (fundingSource) config.fundingSource = fundingSource;
    if (disabled) return;
    const buttons = window.paypal.Buttons(config);
    void buttons.render(container).catch((error: Error) => onError(error.message || "Este método de pago no está disponible."));

    return () => container.replaceChildren();
  }, [checkoutData, disabled, fundingSource, items, onError, onSuccess]);

  return <div className="paypal-official-buttons notranslate" lang="en" translate="no" ref={containerRef} aria-label={fundingSource === "card" ? "Debit or credit card payment" : "PayPal payment"} />;
}
