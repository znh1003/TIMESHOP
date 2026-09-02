"use client";

import { useEffect, useState } from "react";
import ApplePayButton from "./ApplePayButton";
import GooglePayButton from "./GooglePayButton";

interface ExpressCheckoutProps {
  onSuccess: (orderId: string) => void;
  onError: (message: string) => void;
}

declare global {
  interface Window {
    paypal?: any;
    google?: any;
  }
}

export default function ExpressCheckout({ onSuccess, onError }: ExpressCheckoutProps) {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      console.warn("NEXT_PUBLIC_PAYPAL_CLIENT_ID no está configurado");
      return;
    }

    const loadScript = (src: string, attrs?: Record<string, string>): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        if (attrs) {
          Object.entries(attrs).forEach(([key, value]) => {
            script.setAttribute(key, value);
          });
        }
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    };

    const loadAllScripts = async () => {
      try {
        const currency = "MXN";
        const environment = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === "production" ? "production" : "sandbox";

        // Load PayPal SDK with applepay and googlepay components
        await loadScript(
          `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&components=applepay,googlepay&buyer-country=MX`,
        );

        // Load Apple Pay SDK
        await loadScript("https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js");

        // Load Google Pay SDK
        await loadScript("https://pay.google.com/gp/p/js/pay.js");

        setScriptsLoaded(true);
      } catch (err) {
        console.error("Failed to load payment scripts:", err);
      }
    };

    loadAllScripts();
  }, []);

  if (!scriptsLoaded) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
        <span style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Pago rápido
        </span>
        <div style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
      </div>
      <ApplePayButton onSuccess={onSuccess} onError={onError} />
      <GooglePayButton onSuccess={onSuccess} onError={onError} />
    </div>
  );
}
